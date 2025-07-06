import React from "react";
import PageHeading from "../../components/ui/PageHeading";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=128`;

  return (
    <div className="px-2 sm:px-4 py-6 max-w-2xl mx-auto">
      <PageHeading
        title="Profile"
        subtitle="Manage your personal information and security"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Profile" }
        ]}
      />
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center mb-6">
        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full mb-4 shadow" />
        <div className="text-xl font-bold text-gray-800 mb-1">{user?.name || 'User'}</div>
        <div className="text-gray-500 mb-1">{user?.email || '-'}</div>
        <div className="text-gray-500 mb-1">{user?.phone || '-'}</div>
        <div className="text-blue-700 font-medium">{user?.role || ''}</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Change Password</h3>
        <form className="space-y-4 max-w-md mx-auto">
          <Input label="Current Password" type="password" autoComplete="current-password" />
          <Input label="New Password" type="password" autoComplete="new-password" />
          <Input label="Confirm New Password" type="password" autoComplete="new-password" />
          <Button type="submit" className="w-full mt-2">Update Password</Button>
        </form>
      </div>
    </div>
  );
} 