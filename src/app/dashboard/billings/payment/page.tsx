'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GatewayDef {
  id: string
  title: string
  headerTitle?: string
  currencyList?: { label: string; value: string }[]
  testEnvLabel?: { test: string; live: string }
  notice?: string
}

const GATEWAY_LIST: GatewayDef[] = [
  {
    id: 'paypal',
    title: 'Paypal Settings',
    headerTitle: 'PayPal Settings',
    currencyList: [
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
      { label: 'Australian Dollar (AUD)', value: 'AUD' },
      { label: 'Canadian Dollar (CAD)', value: 'CAD' },
      { label: 'Japanese Yen (JPY)', value: 'JPY' },
      { label: 'Brazilian Real (BRL)', value: 'BRL' },
      { label: 'Polish Zloty (PLN)', value: 'PLN' },
      { label: 'Singapore Dollar (SGD)', value: 'SGD' },
      { label: 'Swiss Franc (CHF)', value: 'CHF' },
    ],
    testEnvLabel: {
      test: 'Using Sandbox Environment',
      live: 'Using Production Environment',
    },
  },
  {
    id: 'stripe',
    title: 'Stripe Settings',
    headerTitle: 'Stripe Settings',
    currencyList: [
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
      { label: 'Australian Dollar (AUD)', value: 'AUD' },
      { label: 'Canadian Dollar (CAD)', value: 'CAD' },
      { label: 'Indian Rupee (INR)', value: 'INR' },
      { label: 'Japanese Yen (JPY)', value: 'JPY' },
    ],
    testEnvLabel: {
      test: 'Using Test Keys',
      live: 'Using Live Keys',
    },
  },
  {
    id: 'mollie',
    title: 'Mollie Settings',
    headerTitle: 'Mollie Settings',
    currencyList: [
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
      { label: 'Swiss Franc (CHF)', value: 'CHF' },
      { label: 'Polish Zloty (PLN)', value: 'PLN' },
      { label: 'Swedish Krona (SEK)', value: 'SEK' },
      { label: 'Norwegian Krone (NOK)', value: 'NOK' },
      { label: 'Danish Krone (DKK)', value: 'DKK' },
    ],
    testEnvLabel: {
      test: 'Using Test API Key',
      live: 'Using Live API Key',
    },
  },
  {
    id: 'paystack',
    title: 'Paystack Settings',
    headerTitle: 'Paystack Settings',
    currencyList: [
      { label: 'Nigerian Naira (NGN)', value: 'NGN' },
      { label: 'Ghanaian Cedi (GHS)', value: 'GHS' },
      { label: 'South African Rand (ZAR)', value: 'ZAR' },
      { label: 'Kenyan Shilling (KES)', value: 'KES' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Keys',
      live: 'Using Live Keys',
    },
  },
  {
    id: 'sslcommerz',
    title: 'SSLCommerz Settings',
    headerTitle: 'SSLCommerz Settings',
    currencyList: [
      { label: 'Bangladeshi Taka (BDT)', value: 'BDT' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
    ],
    testEnvLabel: {
      test: 'Using Sandbox Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'razorpay',
    title: 'Razorpay Settings',
    headerTitle: 'Razorpay Settings',
    currencyList: [
      { label: 'Indian Rupee (INR)', value: 'INR' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
      { label: 'Singapore Dollar (SGD)', value: 'SGD' },
      { label: 'UAE Dirham (AED)', value: 'AED' },
    ],
    testEnvLabel: {
      test: 'Using Test Keys',
      live: 'Using Live Keys',
    },
  },
  {
    id: 'flutterwave',
    title: 'Flutterwave Settings',
    headerTitle: 'Flutterwave Settings',
    currencyList: [
      { label: 'Nigerian Naira (NGN)', value: 'NGN' },
      { label: 'Ghanaian Cedi (GHS)', value: 'GHS' },
      { label: 'Kenyan Shilling (KES)', value: 'KES' },
      { label: 'Ugandan Shilling (UGX)', value: 'UGX' },
      { label: 'South African Rand (ZAR)', value: 'ZAR' },
      { label: 'Egyptian Pound (EGP)', value: 'EGP' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Keys',
      live: 'Using Live Keys',
    },
  },
  {
    id: 'xendit',
    title: 'Xendit Settings',
    headerTitle: 'Xendit Settings',
    currencyList: [
      { label: 'Indonesian Rupiah (IDR)', value: 'IDR' },
      { label: 'Philippine Peso (PHP)', value: 'PHP' },
      { label: 'Vietnamese Dong (VND)', value: 'VND' },
      { label: 'Thai Baht (THB)', value: 'THB' },
      { label: 'Malaysian Ringgit (MYR)', value: 'MYR' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Secret Key',
      live: 'Using Live Secret Key',
    },
  },
  {
    id: 'bkash',
    title: 'bKash Settings',
    headerTitle: 'bKash Settings',
    notice: "We couldn't test bKash as we don't have a merchant account. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'jazzcash',
    title: 'JazzCash Settings',
    headerTitle: 'JazzCash Settings',
    notice: "We couldn't test JazzCash from our end as our country does not support JazzCash. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'eps',
    title: 'EPS Settings',
    headerTitle: 'EPS Settings',
    notice: "We couldn't test bKash as we don't have a merchant account. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'Bangladeshi Taka (BDT)', value: 'BDT' },
    ],
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'payhere',
    title: 'Payhere Settings',
    headerTitle: 'Payhere Settings',
    notice: "We couldn't test PayHere from our end as our country does not support PayHere. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'Sri Lankan Rupee (LKR)', value: 'LKR' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'toyyibpay',
    title: 'Toyyibpay Settings',
    headerTitle: 'Toyyibpay Settings',
    notice: "We couldn't test Toyyibpay from our end as our country does not support Toyyibpay. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    testEnvLabel: {
      test: 'Using sandbox (dev.toyyibpay.com)',
      live: 'Using production (toyyibpay.com)',
    },
  },
  {
    id: 'paytabs',
    title: 'Paytabs Settings',
    headerTitle: 'Paytabs Settings',
    notice: "We couldn't test PayTabs from our end as our country does not support PayTabs. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'UAE Dirham (AED)', value: 'AED' },
      { label: 'Saudi Riyal (SAR)', value: 'SAR' },
      { label: 'Egyptian Pound (EGP)', value: 'EGP' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Keys',
      live: 'Using Live Keys',
    },
  },
  {
    id: 'mercadopago',
    title: 'Mercado Pago Settings',
    headerTitle: 'Mercado Pago Settings',
    notice: "We couldn't test MercadoPago from our end as our country does not support MercadoPago. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'Brazilian Real (BRL)', value: 'BRL' },
      { label: 'Argentine Peso (ARS)', value: 'ARS' },
      { label: 'Mexican Peso (MXN)', value: 'MXN' },
      { label: 'Chilean Peso (CLP)', value: 'CLP' },
      { label: 'Colombian Peso (COP)', value: 'COP' },
      { label: 'Peruvian Sol (PEN)', value: 'PEN' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'payu',
    title: 'PayU Settings',
    headerTitle: 'PayU Settings',
    notice: "We couldn't test PayU from our end as our country does not support PayU. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'Polish Zloty (PLN)', value: 'PLN' },
      { label: 'Czech Koruna (CZK)', value: 'CZK' },
      { label: 'Indian Rupee (INR)', value: 'INR' },
      { label: 'Brazilian Real (BRL)', value: 'BRL' },
      { label: 'U.S. Dollar (USD)', value: 'USD' },
    ],
    testEnvLabel: {
      test: 'Using Test Environment',
      live: 'Using Live Environment',
    },
  },
  {
    id: 'braintree',
    title: 'Braintree Settings',
    headerTitle: 'Braintree Settings',
    notice: "We couldn't test Braintree from our end as our country does not support Braintree. If you find any bug/issue please report (send email at support@ui-lib.com) back to us immediately, we'll fix that.",
    currencyList: [
      { label: 'U.S. Dollar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Pound Sterling (GBP)', value: 'GBP' },
      { label: 'Australian Dollar (AUD)', value: 'AUD' },
      { label: 'Canadian Dollar (CAD)', value: 'CAD' },
      { label: 'Japanese Yen (JPY)', value: 'JPY' },
    ],
    testEnvLabel: {
      test: 'Using Sandbox Environment',
      live: 'Using Production Environment',
    },
  },
  {
    id: 'offline',
    title: 'Offline Payment Settings',
    headerTitle: 'Offline Payment Settings',
  },
]

export default function DashboardPaymentGatewaysPage() {
  const [activeTab, setActiveTab] = useState('paypal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Gateways config dictionary
  const [configs, setConfigs] = useState<Record<string, Record<string, any>>>({
    paypal: {
      active: false,
      test_mode: true,
      currency: 'USD',
      sandbox_client_id: '',
      sandbox_secret_key: '',
      production_client_id: '',
      production_secret_key: '',
    },
    stripe: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_public_key: '',
      test_secret_key: '',
      live_public_key: '',
      live_secret_key: '',
    },
    mollie: {
      active: false,
      test_mode: true,
      currency: 'EUR',
      test_api_key: '',
      live_api_key: '',
    },
    paystack: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_public_key: '',
      test_secret_key: '',
      live_public_key: '',
      live_secret_key: '',
    },
    sslcommerz: {
      active: false,
      test_mode: true,
      currency: 'BDT',
      store_id: '',
      store_password: '',
      live_store_id: '',
      live_store_password: '',
    },
    razorpay: {
      active: false,
      test_mode: true,
      currency: 'INR',
      test_key_id: '',
      test_key_secret: '',
      live_key_id: '',
      live_key_secret: '',
    },
    flutterwave: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_public_key: '',
      test_secret_key: '',
      test_encryption_key: '',
      live_public_key: '',
      live_secret_key: '',
      live_encryption_key: '',
    },
    xendit: {
      active: false,
      test_mode: true,
      currency: 'IDR',
      test_secret_key: '',
      live_secret_key: '',
    },
    bkash: {
      active: false,
      test_mode: true,
      test_app_key: '',
      test_app_secret: '',
      test_username: '',
      test_password: '',
      live_app_key: '',
      live_app_secret: '',
      live_username: '',
      live_password: '',
    },
    jazzcash: {
      active: false,
      test_mode: true,
      test_merchant_id: '',
      test_password: '',
      test_integrity_salt: '',
      live_merchant_id: '',
      live_password: '',
      live_integrity_salt: '',
    },
    eps: {
      active: false,
      test_mode: true,
      currency: 'BDT',
      username: '',
      password: '',
      hashkey: '',
      merchant_id: '',
      store_id: '',
      device_type_id: '',
    },
    payhere: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_merchant_id: '',
      test_secret: '',
      live_merchant_id: '',
      live_secret: '',
    },
    toyyibpay: {
      active: false,
      test_mode: true,
      test_user_secret_key: '',
      test_category_code: '',
      live_user_secret_key: '',
      live_category_code: '',
    },
    paytabs: {
      active: false,
      test_mode: true,
      currency: 'USD',
      profile_id: '',
      test_server_key: '',
      live_server_key: '',
    },
    mercadopago: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_access_token: '',
      test_public_key: '',
      live_access_token: '',
      live_public_key: '',
    },
    payu: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_merchant_pos_id: '',
      test_signature_key: '',
      live_merchant_pos_id: '',
      live_signature_key: '',
    },
    braintree: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_merchant_id: '',
      test_public_key: '',
      test_private_key: '',
      live_merchant_id: '',
      live_public_key: '',
      live_private_key: '',
    },
    offline: {
      active: true,
      payment_instructions: '<p>Please deposit the course fee into our bank account and provide the reference receipt below.</p>',
      payment_details: '<p><strong>Bank Name:</strong> JPMorgan Chase Bank<br/><strong>Account Name:</strong> Mentor Learning Technologies Inc.<br/><strong>Account Number:</strong> 9876543210<br/><strong>Routing / SWIFT:</strong> CHASUS33</p>',
    },
  })

  useEffect(() => {
    async function loadGateways() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/settings/gateways')
        if (res.ok) {
          const data = await res.json()
          if (data.gateways) {
            setConfigs((prev) => ({
              ...prev,
              ...data.gateways,
            }))
          }
        }
      } catch (err) {
        console.error('Error loading gateway configs:', err)
      } finally {
        setLoading(false)
      }
    }
    loadGateways()
  }, [])

  const handleFieldChange = (gateway: string, key: string, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [gateway]: {
        ...(prev[gateway] || {}),
        [key]: value,
      },
    }))
  }

  const handleSave = async (gatewayKey: string) => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings/gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: gatewayKey,
          fields: configs[gatewayKey] || {},
        }),
      })

      if (res.ok) {
        toast.success(`Payment gateway settings updated successfully`)
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update gateway settings')
      }
    } catch {
      toast.error('An error occurred while saving gateway settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Payment Gateways"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Payment Gateways' },
        ]}
        className="mb-4"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="grid grid-rows-1 gap-5 md:grid-cols-4 md:px-3"
        >
          {/* Left Vertical Tabs Navigation Card (Exact 1:1 Laravel horizontal-tabs-list) */}
          <div>
            <TabsList className="horizontal-tabs-list">
              {GATEWAY_LIST.map((gateway) => (
                <TabsTrigger
                  key={gateway.id}
                  value={gateway.id}
                  className="horizontal-tabs-trigger"
                >
                  {gateway.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Right Active Gateway Form Card */}
          <div className="md:col-span-3">
            {GATEWAY_LIST.map((gateway) => {
              const cfg = configs[gateway.id] || {}
              const isTestMode = cfg.test_mode ?? true
              const isEnabled = Boolean(cfg.active)
              const testLabel = gateway.testEnvLabel
                ? isTestMode
                  ? gateway.testEnvLabel.test
                  : gateway.testEnvLabel.live
                : isTestMode
                ? 'Using Sandbox Environment'
                : 'Using Production Environment'

              return (
                <TabsContent key={gateway.id} value={gateway.id} className="m-0">
                  <div className="space-y-6 rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                    {/* Notice banner if present in Laravel */}
                    {gateway.notice && (
                      <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
                        {gateway.notice}
                      </div>
                    )}

                    {/* Top Row: Title on Left, Status Switch on Right */}
                    <div className="flex items-center justify-between pb-2">
                      <h2 className="text-xl font-semibold">
                        {gateway.headerTitle || gateway.title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`status-${gateway.id}`} className="mb-0 cursor-pointer text-sm font-medium">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`status-${gateway.id}`}
                          checked={isEnabled}
                          onCheckedChange={(val) => handleFieldChange(gateway.id, 'active', val)}
                        />
                      </div>
                    </div>

                    {/* Offline Bank Form Special Case */}
                    {gateway.id === 'offline' ? (
                      <div className="space-y-4">
                        <div>
                          <Label>
                            Payment Instructions{' '}
                            <span className="font-light">(for student)</span>
                          </Label>
                          <Textarea
                            rows={6}
                            value={cfg.payment_instructions || ''}
                            onChange={(e) => handleFieldChange('offline', 'payment_instructions', e.target.value)}
                            placeholder="Enter instructions here..."
                            className="mt-1"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            These instructions will be shown to students when they select offline payment
                          </p>
                        </div>

                        <div>
                          <Label>Payment Details</Label>
                          <Textarea
                            rows={6}
                            value={cfg.payment_details || ''}
                            onChange={(e) => handleFieldChange('offline', 'payment_details', e.target.value)}
                            placeholder="Enter payment details here..."
                            className="mt-1"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            These payment/bank details will be displayed to students for making offline payments
                          </p>
                        </div>

                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                          <div className="flex">
                            <svg
                              className="mr-2 h-5 w-5 shrink-0 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="text-sm text-yellow-800">
                              <p className="mb-1 font-medium">Important Notice</p>
                              <p>
                                Offline payments require manual verification. You will need to approve each payment in the Payment History section before the student can access the course.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button
                            onClick={() => handleSave('offline')}
                            disabled={saving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Two Columns: Currency on Left, Test Mode on Right */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {gateway.currencyList ? (
                            <div>
                              <Label>Currency</Label>
                              <Select
                                value={cfg.currency || gateway.currencyList[0].value}
                                onValueChange={(val) => handleFieldChange(gateway.id, 'currency', val)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {gateway.currencyList.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      {c.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div />
                          )}

                          <div>
                            <span className="mb-3 block text-sm font-medium">Test Mode:</span>
                            <div className="flex items-center space-x-2 pt-1">
                              <Switch
                                id={`test_mode_${gateway.id}`}
                                checked={isTestMode}
                                onCheckedChange={(val) => handleFieldChange(gateway.id, 'test_mode', val)}
                              />
                              <Label
                                htmlFor={`test_mode_${gateway.id}`}
                                className="mb-0 text-gray-500 cursor-pointer text-sm"
                              >
                                {testLabel}
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Sandbox / Test Credentials Section */}
                        <div
                          className={cn('border-b pb-6 space-y-4', {
                            'opacity-60': !isTestMode,
                          })}
                        >
                          <h3 className="text-lg font-medium">
                            {['stripe', 'flutterwave', 'paystack', 'paytabs'].includes(gateway.id)
                              ? 'Test Credentials'
                              : gateway.id === 'eps'
                              ? 'API Credentials'
                              : 'Sandbox Credentials'}
                          </h3>

                          {gateway.id === 'paypal' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Sandbox Client ID</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.sandbox_client_id || ''}
                                  onChange={(e) => handleFieldChange('paypal', 'sandbox_client_id', e.target.value)}
                                  placeholder="Enter sandbox client ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.sandbox_secret_key || ''}
                                  onChange={(e) => handleFieldChange('paypal', 'sandbox_secret_key', e.target.value)}
                                  placeholder="Enter sandbox secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'stripe' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test Public Key</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_public_key || ''}
                                  onChange={(e) => handleFieldChange('stripe', 'test_public_key', e.target.value)}
                                  placeholder="Enter test public key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_secret_key || ''}
                                  onChange={(e) => handleFieldChange('stripe', 'test_secret_key', e.target.value)}
                                  placeholder="Enter test secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'mollie' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test API Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_api_key || ''}
                                  onChange={(e) => handleFieldChange('mollie', 'test_api_key', e.target.value)}
                                  placeholder="Enter test API key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'paystack' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test Public Key</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_public_key || ''}
                                  onChange={(e) => handleFieldChange('paystack', 'test_public_key', e.target.value)}
                                  placeholder="Enter test public key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_secret_key || ''}
                                  onChange={(e) => handleFieldChange('paystack', 'test_secret_key', e.target.value)}
                                  placeholder="Enter test secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'sslcommerz' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Sandbox Store ID</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_store_id || cfg.store_id || ''}
                                  onChange={(e) => handleFieldChange('sslcommerz', 'store_id', e.target.value)}
                                  placeholder="Enter sandbox store ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox Store Password</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_store_password || cfg.store_password || ''}
                                  onChange={(e) => handleFieldChange('sslcommerz', 'store_password', e.target.value)}
                                  placeholder="Enter sandbox store password"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'razorpay' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test Key ID</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_key_id || cfg.api_key || ''}
                                  onChange={(e) => handleFieldChange('razorpay', 'test_key_id', e.target.value)}
                                  placeholder="Enter test key ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Key Secret</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_key_secret || cfg.api_secret || ''}
                                  onChange={(e) => handleFieldChange('razorpay', 'test_key_secret', e.target.value)}
                                  placeholder="Enter test key secret"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'flutterwave' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test Public Key</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_public_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'test_public_key', e.target.value)}
                                  placeholder="FLWPUBK_TEST-xxxxxxxxxxxxxxxx-X"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_secret_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'test_secret_key', e.target.value)}
                                  placeholder="FLWSECK_TEST-xxxxxxxxxxxxxxxx-X"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Encryption Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_encryption_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'test_encryption_key', e.target.value)}
                                  placeholder="FLWSECK_TEST-xxxxxxxxxxxxxxxx"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'bkash' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <div>
                                <Label>Sandbox App Key</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_app_key || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'test_app_key', e.target.value)}
                                  placeholder="Enter sandbox app key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox App Secret</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_app_secret || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'test_app_secret', e.target.value)}
                                  placeholder="Enter sandbox app secret"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox Username</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_username || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'test_username', e.target.value)}
                                  placeholder="Enter sandbox username"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox Password</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_password || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'test_password', e.target.value)}
                                  placeholder="Enter sandbox password"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {/* Generic Sandbox Fallback */}
                          {!['paypal', 'stripe', 'mollie', 'paystack', 'sslcommerz', 'razorpay', 'flutterwave', 'bkash'].includes(gateway.id) && (
                            <div className="space-y-4">
                              <div>
                                <Label>Sandbox / Test Client ID or Key</Label>
                                <Input
                                  disabled={!isTestMode}
                                  value={cfg.test_public_key || cfg.test_merchant_id || cfg.test_access_token || ''}
                                  onChange={(e) => handleFieldChange(gateway.id, 'test_public_key', e.target.value)}
                                  placeholder="Enter sandbox identifier"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sandbox / Test Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={!isTestMode}
                                  value={cfg.test_secret_key || cfg.test_password || cfg.test_secret || ''}
                                  onChange={(e) => handleFieldChange(gateway.id, 'test_secret_key', e.target.value)}
                                  placeholder="Enter sandbox secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Production / Live Credentials Section */}
                        <div
                          className={cn('space-y-4', {
                            'opacity-60': isTestMode,
                          })}
                        >
                          <h3 className="text-lg font-medium">
                            {['stripe', 'flutterwave', 'paystack', 'paytabs'].includes(gateway.id)
                              ? 'Live Credentials'
                              : 'Production Credentials'}
                          </h3>

                          {gateway.id === 'paypal' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Production Client ID</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.production_client_id || ''}
                                  onChange={(e) => handleFieldChange('paypal', 'production_client_id', e.target.value)}
                                  placeholder="Enter production client ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Production Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.production_secret_key || ''}
                                  onChange={(e) => handleFieldChange('paypal', 'production_secret_key', e.target.value)}
                                  placeholder="Enter production secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'stripe' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Public Key</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_public_key || ''}
                                  onChange={(e) => handleFieldChange('stripe', 'live_public_key', e.target.value)}
                                  placeholder="Enter live public key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_secret_key || ''}
                                  onChange={(e) => handleFieldChange('stripe', 'live_secret_key', e.target.value)}
                                  placeholder="Enter live secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'mollie' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live API Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_api_key || ''}
                                  onChange={(e) => handleFieldChange('mollie', 'live_api_key', e.target.value)}
                                  placeholder="Enter live API key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'paystack' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Public Key</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_public_key || ''}
                                  onChange={(e) => handleFieldChange('paystack', 'live_public_key', e.target.value)}
                                  placeholder="Enter live public key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_secret_key || ''}
                                  onChange={(e) => handleFieldChange('paystack', 'live_secret_key', e.target.value)}
                                  placeholder="Enter live secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'sslcommerz' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Store ID</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_store_id || ''}
                                  onChange={(e) => handleFieldChange('sslcommerz', 'live_store_id', e.target.value)}
                                  placeholder="Enter live store ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Store Password</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_store_password || ''}
                                  onChange={(e) => handleFieldChange('sslcommerz', 'live_store_password', e.target.value)}
                                  placeholder="Enter live store password"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'razorpay' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Key ID</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_key_id || ''}
                                  onChange={(e) => handleFieldChange('razorpay', 'live_key_id', e.target.value)}
                                  placeholder="Enter live key ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Key Secret</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_key_secret || ''}
                                  onChange={(e) => handleFieldChange('razorpay', 'live_key_secret', e.target.value)}
                                  placeholder="Enter live key secret"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'flutterwave' && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Public Key</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_public_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'live_public_key', e.target.value)}
                                  placeholder="FLWPUBK-xxxxxxxxxxxxxxxx-X"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_secret_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'live_secret_key', e.target.value)}
                                  placeholder="FLWSECK-xxxxxxxxxxxxxxxx-X"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Encryption Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_encryption_key || ''}
                                  onChange={(e) => handleFieldChange('flutterwave', 'live_encryption_key', e.target.value)}
                                  placeholder="FLWSECK-xxxxxxxxxxxxxxxx"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {gateway.id === 'bkash' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <div>
                                <Label>Live App Key</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_app_key || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'live_app_key', e.target.value)}
                                  placeholder="Enter live app key"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live App Secret</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_app_secret || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'live_app_secret', e.target.value)}
                                  placeholder="Enter live app secret"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Username</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_username || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'live_username', e.target.value)}
                                  placeholder="Enter live username"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Password</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_password || ''}
                                  onChange={(e) => handleFieldChange('bkash', 'live_password', e.target.value)}
                                  placeholder="Enter live password"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {/* Generic Live Fallback */}
                          {!['paypal', 'stripe', 'mollie', 'paystack', 'sslcommerz', 'razorpay', 'flutterwave', 'bkash'].includes(gateway.id) && (
                            <div className="space-y-4">
                              <div>
                                <Label>Live Client ID or Key</Label>
                                <Input
                                  disabled={isTestMode}
                                  value={cfg.live_public_key || cfg.live_merchant_id || cfg.live_access_token || ''}
                                  onChange={(e) => handleFieldChange(gateway.id, 'live_public_key', e.target.value)}
                                  placeholder="Enter live identifier"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Live Secret Key</Label>
                                <Input
                                  type="password"
                                  disabled={isTestMode}
                                  value={cfg.live_secret_key || cfg.live_password || cfg.live_secret || ''}
                                  onChange={(e) => handleFieldChange(gateway.id, 'live_secret_key', e.target.value)}
                                  placeholder="Enter live secret key"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                          <Button
                            onClick={() => handleSave(gateway.id)}
                            disabled={saving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </div>
        </Tabs>
      )}
    </DashboardLayout>
  )
}
