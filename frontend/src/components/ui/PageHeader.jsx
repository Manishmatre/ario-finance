import React from "react";
import { Link } from "react-router-dom";

export default function PageHeader({ title, breadcrumbs = [], actions }) {
  return (
    <div className="mb-8">
      {breadcrumbs.length > 0 && (
        <nav className="mb-1 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-reset flex">
            {breadcrumbs.map((bc, idx) => (
              <li key={idx} className="flex items-center">
                {bc.to ? (
                  <Link to={bc.to} className="hover:underline text-blue-600">{bc.label}</Link>
                ) : (
                  <span className="text-gray-700">{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="mx-2">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}
