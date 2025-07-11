import React, { useState } from "react";
import PageHeading from "../../components/ui/PageHeading";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { useAuth } from "../../contexts/useAuth";
import { FiBriefcase, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import axios from "../../utils/axios";

export default function Profile() {
  const { user, company } = useAuth();
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=128`;

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      await axios.post("/api/auth/change-password", {
        currentPassword,
        newPassword
      });
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(
        err.response?.data?.error || err.response?.data?.message || "Failed to update password."
      );
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Profile"
        subtitle="Manage your personal and company information"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Profile" }
        ]}
      />
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="flex flex-col items-center">
        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full mb-4 shadow" />
        <div className="text-xl font-bold text-gray-800 mb-1">{user?.name || 'User'}</div>
        <div className="text-gray-500 mb-1">{user?.email || '-'}</div>
          <div className="text-gray-500 mb-1">{company?.contactPhone || '-'}</div>
        <div className="text-blue-700 font-medium">{user?.role || ''}</div>
        </Card>
        <Card title="Company Information" icon={<FiBriefcase className="text-blue-600 w-6 h-6" />}> 
          <div className="space-y-1">
            <div className="font-semibold text-lg text-gray-800">{company?.name || '-'}</div>
            <div className="text-gray-500 text-sm mb-2">{company?.companyType || '-'}</div>
            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">PAN:</span> {company?.pan || '-'}</div>
            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">GST:</span> {company?.gstNo || '-'}</div>
            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Contact Person:</span> {company?.contactPerson || '-'}</div>
            <div className="flex items-center gap-2 text-gray-700"><FiPhone className="inline-block" /><span className="font-medium">Phone:</span> {company?.contactPhone || '-'}</div>
            <div className="flex items-center gap-2 text-gray-700"><FiMail className="inline-block" /><span className="font-medium">Email:</span> {company?.contactEmail || '-'}</div>
            {company?.address && (
              <div className="mt-2 text-gray-700 text-sm flex items-start gap-2">
                <FiMapPin className="mt-0.5" />
                <span>
                  {company.address.addressLine1}<br />
                  {company.address.addressLine2 && (<>{company.address.addressLine2}<br /></>)}
                  {company.address.city}, {company.address.state} - {company.address.pincode}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
              <span>Created:</span> {company?.createdAt ? new Date(company.createdAt).toLocaleString() : '-'}
              <span>|</span>
              <span>Updated:</span> {company?.updatedAt ? new Date(company.updatedAt).toLocaleString() : '-'}
            </div>
          </div>
        </Card>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Change Password</h3>
        {pwSuccess && <div className="mb-2 text-green-600 text-center">{pwSuccess}</div>}
        {pwError && <div className="mb-2 text-red-600 text-center">{pwError}</div>}
        <form className="space-y-4 max-w-md mx-auto" onSubmit={handlePasswordChange}>
          <Input label="Current Password" type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Input label="Confirm New Password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <Button type="submit" className="w-full mt-2" disabled={pwLoading}>{pwLoading ? "Updating..." : "Update Password"}</Button>
        </form>
      </div>
    </div>
  );
} 