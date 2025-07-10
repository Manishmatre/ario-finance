import React from "react";
import PageHeading from "../../components/ui/PageHeading";

export default function Settings() {
  return (
    <div className="px-2 sm:px-4 py-6 max-w-3xl mx-auto">
      <PageHeading
        title="Finance Settings"
        subtitle="Manage all finance-related settings from one place"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Settings" }
        ]}
      />
      <div className="space-y-6">
        {/* Bank Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Bank Settings</h3>
          <p className="text-gray-500 text-sm mb-2">Configure your bank integration, default bank, and related preferences.</p>
          <div className="text-gray-400 text-sm">(Coming soon...)</div>
        </div>
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Account Settings</h3>
          <p className="text-gray-500 text-sm mb-2">Manage account types, numbering, and chart of accounts preferences.</p>
          <div className="text-gray-400 text-sm">(Coming soon...)</div>
        </div>
        {/* Transaction Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Transaction Settings</h3>
          <p className="text-gray-500 text-sm mb-2">Set transaction approval rules, limits, and notifications.</p>
          <div className="text-gray-400 text-sm">(Coming soon...)</div>
        </div>
        {/* Payables Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Payables Settings</h3>
          <p className="text-gray-500 text-sm mb-2">Control vendor, bill, and payment workflow settings.</p>
          <div className="text-gray-400 text-sm">(Coming soon...)</div>
        </div>
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">General Settings</h3>
          <p className="text-gray-500 text-sm mb-2">Other finance-related preferences and defaults.</p>
          <div className="text-gray-400 text-sm">(Coming soon...)</div>
        </div>
      </div>
    </div>
  );
} 