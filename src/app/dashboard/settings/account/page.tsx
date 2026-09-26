'use client'

import React, { useState } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UpdateProfile from '@/components/account/update-profile'
import ChangeEmail from '@/components/account/change-email'
import ChangePassword from '@/components/account/change-password'
import ForgetPassword from '@/components/account/forget-password'

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile-update')

  const tabTitleMap: Record<string, string> = {
    'profile-update': 'Profile Update',
    'change-email': 'Change Email',
    'change-password': 'Change Password',
    'forget-password': 'Forget Password',
  }

  return (
    <DashboardLayout role="instructor">
      <div className="space-y-4">
        <Breadcrumbs
          title="Account Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: tabTitleMap[activeTab] || 'Profile Update' },
          ]}
          className="mb-4"
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="grid grid-rows-1 gap-5 md:grid-cols-4 md:px-3"
        >
          <div>
            <TabsList className="horizontal-tabs-list">
              <TabsTrigger
                value="profile-update"
                className="horizontal-tabs-trigger"
              >
                Profile Update
              </TabsTrigger>
              <TabsTrigger
                value="change-email"
                className="horizontal-tabs-trigger"
              >
                Change Email
              </TabsTrigger>
              <TabsTrigger
                value="change-password"
                className="horizontal-tabs-trigger"
              >
                Change Password
              </TabsTrigger>
              <TabsTrigger
                value="forget-password"
                className="horizontal-tabs-trigger"
              >
                Forget Password
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="md:col-span-3">
            <TabsContent value="profile-update" className="m-0">
              <UpdateProfile />
            </TabsContent>
            <TabsContent value="change-email" className="m-0">
              <ChangeEmail />
            </TabsContent>
            <TabsContent value="change-password" className="m-0">
              <ChangePassword />
            </TabsContent>
            <TabsContent value="forget-password" className="m-0">
              <ForgetPassword />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
