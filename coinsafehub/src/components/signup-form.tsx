'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Password strength calculator
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (formData.password.length >= 8) strength++
    if (/[a-z]/.test(formData.password)) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/[0-9]/.test(formData.password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength++
    
    setPasswordStrength(strength)
  }, [formData.password])

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Fair'
    if (passwordStrength <= 4) return 'Good'
    return 'Strong'
  }

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return null
  }

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Must contain an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Must contain a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Must contain a number'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must contain a special character'
    return null
  }

  const validateName = (name: string, field: string): string | null => {
    if (name.length < 2) return `${field} must be at least 2 characters`
    if (name.length > 50) return `${field} must be less than 50 characters`
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${field} can only contain letters, spaces, hyphens, and apostrophes`
    }
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear field error when user starts typing
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
    let error: string | null = null

    switch (name) {
      case 'email':
        error = validateEmail(value)
        break
      case 'username':
        error = validateUsername(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'first_name':
        error = validateName(value, 'First name')
        break
      case 'last_name':
        error = validateName(value, 'Last name')
        break
      case 'password2':
        if (value !== formData.password) {
          error = 'Passwords do not match'
        }
        break
    }

    if (error) {
      setFieldErrors({
        ...fieldErrors,
        [name]: error
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError

    const usernameError = validateUsername(formData.username)
    if (usernameError) errors.username = usernameError

    const passwordError = validatePassword(formData.password)
    if (passwordError) errors.password = passwordError

    const firstNameError = validateName(formData.first_name, 'First name')
    if (firstNameError) errors.first_name = firstNameError

    const lastNameError = validateName(formData.last_name, 'Last name')
    if (lastNameError) errors.last_name = lastNameError

    if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement backend endpoint for registration
      const response = await fetch(``, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Account created! Check your email for the verification code.')
        
        // Store email for OTP verification page
        sessionStorage.setItem('verificationEmail', formData.email)
        sessionStorage.setItem('signupTime', Date.now().toString())
        
        // Redirect to OTP page after 2 seconds
        setTimeout(() => {
          router.push('/otp')
        }, 2000)
      } else {
        // Handle different error types
        if (response.status === 400) {
          setError(data.message || data.error || 'Invalid input. Please check your information.')
        } else if (response.status === 409) {
          setError('Email or username already exists. Please try another.')
        } else if (response.status === 500) {
          setError('Server error. Please try again later.')
        } else {
          setError(data.message || data.error || 'Signup failed. Please try again.')
        }
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isLoading} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input 
                  id="username" 
                  name="username"
                  type="text" 
                  placeholder="ehi" 
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={fieldErrors.username ? "username-error" : undefined}
                  required 
                />
                {fieldErrors.username && (
                  <FieldDescription id="username-error" className="text-red-500">
                    {fieldErrors.username}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                  <Input 
                    id="first_name" 
                    name="first_name"
                    type="text" 
                    placeholder="Iganya" 
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!fieldErrors.first_name}
                    required 
                  />
                  {fieldErrors.first_name && (
                    <FieldDescription className="text-red-500 text-xs">
                      {fieldErrors.first_name}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                  <Input 
                    id="last_name" 
                    name="last_name"
                    type="text" 
                    placeholder="Ehi" 
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!fieldErrors.last_name}
                    required 
                  />
                  {fieldErrors.last_name && (
                    <FieldDescription className="text-red-500 text-xs">
                      {fieldErrors.last_name}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="matthew@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!fieldErrors.email}
                  required
                />
                {fieldErrors.email ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.email}
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    We&apos;ll send a verification code to this email.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!fieldErrors.password}
                    className="pr-10"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <FieldDescription className={passwordStrength <= 2 ? 'text-red-500' : ''}>
                      Password strength: {getPasswordStrengthText()}
                    </FieldDescription>
                  </div>
                )}
                {fieldErrors.password ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.password}
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    Must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password2">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input 
                    id="password2" 
                    name="password2"
                    type={showPassword2 ? "text" : "password"}
                    value={formData.password2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!fieldErrors.password2}
                    className="pr-10"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password2 ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.password2}
                  </FieldDescription>
                ) : (
                  <FieldDescription>Please confirm your password.</FieldDescription>
                )}
              </Field>

              {error && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-700 p-3 bg-green-50 rounded-md border border-green-200" role="alert">
                  {success}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}