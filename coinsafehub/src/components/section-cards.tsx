'use client'

import { useEffect, useState } from "react"
import { 
  IconWallet, 
  IconArrowUpRight, 
  IconArrowDownLeft, 
  IconGift, 
  IconUsers, 
  IconRefresh, 
  IconTrendingUp,
  IconChartLine
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface AccountSummary {
  account_balance: number
  total_deposit: number
  total_withdrawal: number
  bonus: number
  referral_bonus: number
  recovered_balance: number
  profit_bonus: number
  investment_balance: number
}

interface CardData {
  label: string
  key: keyof AccountSummary
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  description: string
}

export function SectionCards() {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAccountSummary = async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setError('Please log in to view your account summary')
        setIsLoading(false)
        return
      }

      const response = await fetch(`https://server.coinsafehub.com/api/trans/account_summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('authToken')
        window.location.href = '/login'
        return
      }

      const data = await response.json()
      
      if (response.ok) {
        setSummary(data)
        setLastUpdated(new Date())
      } else {
        setError(data.message || 'Failed to load account summary')
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Network error. Please check your connection.')
      } else {
        setError('Failed to load account data. Please try again.')
      }
      console.error('Account summary error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccountSummary()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAccountSummary()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const calculateTrend = (current: number, previous: number): { value: string; isPositive: boolean } => {
    if (previous === 0) return { value: '+0%', isPositive: true }
    const percentChange = ((current - previous) / previous) * 100
    return {
      value: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      isPositive: percentChange >= 0
    }
  }

  const cardConfigs: CardData[] = [
    {
      label: "Account Balance",
      key: "account_balance",
      icon: <IconWallet className="size-5" />,
      description: "Your current available balance"
    },
    {
      label: "Total Deposits",
      key: "total_deposit",
      icon: <IconArrowDownLeft className="size-5" />,
      description: "All-time deposits to your account"
    },
    {
      label: "Total Withdrawals",
      key: "total_withdrawal",
      icon: <IconArrowUpRight className="size-5" />,
      description: "All-time withdrawals from account"
    },
    {
      label: "Bonus",
      key: "bonus",
      icon: <IconGift className="size-5" />,
      description: "Current bonus amount"
    },
    {
      label: "Referral Bonus",
      key: "referral_bonus",
      icon: <IconUsers className="size-5" />,
      description: "Earnings from referrals"
    },
    {
      label: "Recovered Balance",
      key: "recovered_balance",
      icon: <IconRefresh className="size-5" />,
      description: "Successfully recovered funds"
    },
    {
      label: "Profit Bonus",
      key: "profit_bonus",
      icon: <IconTrendingUp className="size-5" />,
      description: "Profit-based bonus rewards"
    },
    {
      label: "Investment Balance",
      key: "investment_balance",
      icon: <IconChartLine className="size-5" />,
      description: "Current investment portfolio value"
    }
  ]

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              <CardTitle className="text-lg">Error Loading Account Summary</CardTitle>
            </div>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <button
              onClick={fetchAccountSummary}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Try Again
            </button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {lastUpdated && (
        <div className="px-4 lg:px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={fetchAccountSummary}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <IconRefresh className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      )}
      
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cardConfigs.map((config) => {
          const value = summary?.[config.key] ?? 0
          const isPositiveMetric = !['total_withdrawal'].includes(config.key)
          const isIncrease = value > 0
          
          return (
            <Card key={config.key} className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatCurrency(value)}
                </CardTitle>
                <CardAction>
                  {value > 0 && (
                    <Badge 
                      variant="outline"
                      className={
                        isPositiveMetric && isIncrease
                          ? "text-green-600 border-green-200 bg-green-50"
                          : !isPositiveMetric && isIncrease
                          ? "text-red-600 border-red-200 bg-red-50"
                          : "text-gray-600 border-gray-200 bg-gray-50"
                      }
                    >
                      {isIncrease ? <IconTrendingUp /> : <IconArrowDownLeft />}
                      Active
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  {config.description}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}