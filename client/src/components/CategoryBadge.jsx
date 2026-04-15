import React from 'react';

const CLASS_MAP = {
  Food: 'cat-food', Transport: 'cat-transport', Rent: 'cat-rent',
  Entertainment: 'cat-entertainment', Shopping: 'cat-shopping', Health: 'cat-health',
  Utilities: 'cat-utilities', Education: 'cat-education', Travel: 'cat-travel', Other: 'cat-other'
};

export function CategoryBadge({ category }) {
  return (
    <span className={`badge ${CLASS_MAP[category] || 'cat-other'}`}>
      {getCatEmoji(category)} {category}
    </span>
  );
}

export function getCatEmoji(cat) {
  const map = {
    Food: '🍔', Transport: '🚗', Rent: '🏠', Entertainment: '🎬',
    Shopping: '🛍️', Health: '💊', Utilities: '⚡', Education: '📚',
    Travel: '✈️', Other: '📦'
  };
  return map[cat] || '📦';
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
