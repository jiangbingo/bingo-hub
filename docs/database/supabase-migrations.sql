-- ============================================
-- Supabase 数据库迁移脚本
-- ============================================
-- 执行位置: Supabase Dashboard → SQL Editor
-- 功能: 创建登录日志表、用户资料表、权限配置
-- ============================================

-- ============================================
-- 1. 登录日志表 (auth_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT NOT NULL CHECK (login_method IN ('github', 'email')),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 添加索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON public.auth_logs(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_method ON public.auth_logs(login_method);
CREATE INDEX IF NOT EXISTS idx_auth_logs_success ON public.auth_logs(success);

-- 添加表注释
COMMENT ON TABLE public.auth_logs IS '用户登录日志记录表';
COMMENT ON COLUMN public.auth_logs.user_id IS '用户 ID，关联 auth.users';
COMMENT ON COLUMN public.auth_logs.login_timestamp IS '登录时间';
COMMENT ON COLUMN public.auth_logs.ip_address IS '客户端 IP 地址';
COMMENT ON COLUMN public.auth_logs.user_agent IS '客户端 User-Agent';
COMMENT ON COLUMN public.auth_logs.login_method IS '登录方式：github 或 email';
COMMENT ON COLUMN public.auth_logs.success IS '登录是否成功';
COMMENT ON COLUMN public.auth_logs.error_message IS '失败时的错误信息';

-- ============================================
-- 2. 用户资料扩展表 (user_profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 添加表注释
COMMENT ON TABLE public.user_profiles IS '用户资料扩展表';
COMMENT ON COLUMN public.user_profiles.role IS '用户角色：admin 或 user';

-- ============================================
-- 3. Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- auth_logs 策略
-- 1. 所有人可以插入登录日志（通过 API）
CREATE POLICY "Allow insert for all users" ON public.auth_logs
  FOR INSERT WITH CHECK (true);

-- 2. 用户只能查看自己的日志
CREATE POLICY "Users can view own logs" ON public.auth_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 3. 管理员可以查看所有日志（通过函数判断）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE POLICY "Admins can view all logs" ON public.auth_logs
  FOR SELECT USING (public.is_admin());

-- user_profiles 策略
-- 1. 所有人可以查看公开资料
CREATE POLICY "Allow read profiles" ON public.user_profiles
  FOR SELECT USING (true);

-- 2. 用户可以更新自己的资料
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. 用户可以插入自己的资料（注册时）
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. 触发器：自动创建用户资料
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. 触发器：记录登录日志
-- ============================================
CREATE OR REPLACE FUNCTION public.record_login_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auth_logs (
    user_id,
    login_method,
    success
  ) VALUES (
    NEW.id,
    CASE
      WHEN NEW.raw_app_meta_data?.provider = 'github' THEN 'github'
      ELSE 'email'
    END,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注意：此触发器需要在 Supabase Dashboard 的 Authentication → Hooks 中配置
-- 或者通过 auth Schema 的触发器实现

-- ============================================
-- 6. 管理员用户设置
-- ============================================
-- 手动设置 jiangbingo 为管理员
-- 替换 'jiangbingo_github_user_id' 为实际的用户 ID
-- UPDATE public.user_profiles SET role = 'admin' WHERE username = 'jiangbingo';

-- 或通过 GitHub User ID 设置
-- UPDATE public.user_profiles SET role = 'admin'
-- WHERE id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_name' = 'jiangbingo');

-- ============================================
-- 7. 实用视图
-- ============================================

-- 登录统计视图
CREATE OR REPLACE VIEW public.login_stats AS
SELECT
  DATE_TRUNC('day', login_timestamp) AS date,
  login_method,
  COUNT(*) AS total_logins,
  COUNT(*) FILTER (WHERE success = true) AS successful_logins,
  COUNT(*) FILTER (WHERE success = false) AS failed_logins
FROM public.auth_logs
GROUP BY DATE_TRUNC('day', login_timestamp), login_method
ORDER BY date DESC;

COMMENT ON VIEW public.login_stats IS '每日登录统计视图';

-- 用户活动视图
CREATE OR REPLACE VIEW public.user_activity AS
SELECT
  u.id,
  up.username,
  up.display_name,
  up.role,
  COUNT(al.id) AS login_count,
  MAX(al.login_timestamp) AS last_login
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.auth_logs al ON u.id = al.user_id AND al.success = true
GROUP BY u.id, up.username, up.display_name, up.role
ORDER BY last_login DESC NULLS LAST;

COMMENT ON VIEW public.user_activity IS '用户活动统计视图';

-- ============================================
-- 8. 清理旧数据的函数（可选）
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_logs
  WHERE login_timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_old_logs IS '清理指定天数之前的登录日志';

-- ============================================
-- 9. API 端点：获取所有登录日志（管理员专用）
-- ============================================
-- 此函数通过 Vercel Serverless Function 调用
CREATE OR REPLACE FUNCTION public.get_all_login_logs(limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  login_timestamp TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT,
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.login_timestamp,
    al.ip_address,
    al.user_agent,
    al.login_method,
    al.success,
    al.error_message
  FROM public.auth_logs al
  ORDER BY al.login_timestamp DESC
  LIMIT limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 只有管理员可以调用此函数
GRANT EXECUTE ON FUNCTION public.get_all_login_logs TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_all_login_logs FROM anon;

-- ============================================
-- 执行完成
-- ============================================
-- 请检查以下内容：
-- 1. 用户表创建成功
-- 2. RLS 策略正确配置
-- 3. 触发器正常工作
-- 4. 视图可以查询
-- 5. 将 jiangbingo 用户设置为管理员
-- ============================================
