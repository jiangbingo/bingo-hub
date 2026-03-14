import React from 'react';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  onClick: () => void;
}

export function ToolCard({ id, name, description, icon, onClick }: ToolCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{name}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{description}</p>
    </div>
  );
}
