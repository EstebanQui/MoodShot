import bcrypt from 'bcryptjs'

describe('Validation Utils', () => {
  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const plainPassword = 'testPassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(20)
    })

    it('should verify passwords correctly', async () => {
      const plainPassword = 'testPassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      const isValid = await bcrypt.compare(plainPassword, hashedPassword)
      expect(isValid).toBe(true)

      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('Email Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com'
      ]

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Username Validation', () => {
    it('should validate username requirements', () => {
      const validUsernames = [
        'testuser',
        'user123',
        'test_user',
        'user-name'
      ]

      const invalidUsernames = [
        '',
        'a',
        'user with spaces',
        'user@name'
      ]

      validUsernames.forEach(username => {
        expect(username.length).toBeGreaterThan(1)
        expect(username).toMatch(/^[a-zA-Z0-9_-]+$/)
      })

      invalidUsernames.forEach(username => {
        const isValid = username.length > 1 && /^[a-zA-Z0-9_-]+$/.test(username)
        expect(isValid).toBe(false)
      })
    })
  })
}) 