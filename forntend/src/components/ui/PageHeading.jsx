import React from "react";
import { Link } from "react-router-dom";

export default function PageHeading({ title, subtitle, breadcrumbs = [] }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {breadcrumbs.length > 0 && (
          <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
            {breadcrumbs.map((bc, idx) => (
              <span key={bc.label} className="flex items-center">
                {bc.to ? (
                  <Link to={bc.to} className="hover:underline text-blue-600">{bc.label}</Link>
                ) : (
                  <span>{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="mx-2">/</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
