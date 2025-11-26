'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Validation
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear errors when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      })
    }
    setError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'email') {
      const emailError = validateEmail(value)
      if (emailError) {
        setFieldErrors({
          ...fieldErrors,
          email: emailError
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate form
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) errors.email = emailError
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fix the errors above')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('https://server.coinsafehub.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Store authentication token
        if (data.token || data.access_token) {
          const token = data.token || data.access_token
          localStorage.setItem('authToken', token)
          // Or use sessionStorage for session-only storage
          // sessionStorage.setItem('authToken', token)
        }

        // Store user data if provided
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Handle different error types
        if (response.status === 401) {
          setError('Invalid email or password')
        } else if (response.status === 403) {
          setError('Account not verified. Please check your email.')
          // Optionally redirect to OTP verification
          // sessionStorage.setItem('verificationEmail', formData.email)
          // router.push('/verify-otp')
        } else if (response.status === 404) {
          setError('Account not found. Please sign up.')
        } else if (response.status === 429) {
          setError('Too many login attempts. Please try again later.')
        } else if (response.status === 500) {
          setError('Server error. Please try again later.')
        } else {
          setError(data.message || data.error || 'Login failed. Please try again.')
        }
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isLoading}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    required
                  />
                  {fieldErrors.email && (
                    <FieldDescription id="email-error" className="text-red-500">
                      {fieldErrors.email}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.password}
                      className="pr-10"
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <FieldDescription className="text-red-500">
                      {fieldErrors.password}
                    </FieldDescription>
                  )}
                </Field>

                {error && (
                  <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2" role="alert">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Field>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                  <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-primary hover:underline font-medium">
                      Sign up
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}