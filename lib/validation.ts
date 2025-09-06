// Platform validation rules and utilities
export const PLATFORM_RULES = {
  INSTAGRAM: {
    photo: {
      minWidth: 320,
      maxWidth: 1080,
      aspectRatios: ["1:1", "4:5", "16:9"],
      maxFileSize: 8 * 1024 * 1024, // 8MB
      formats: ["jpg", "jpeg", "png"],
    },
    video: {
      minWidth: 320,
      maxWidth: 1080,
      maxDuration: 60,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      formats: ["mp4", "mov"],
    },
    story: {
      aspectRatio: "9:16",
      maxDuration: 15,
      maxFileSize: 100 * 1024 * 1024,
    },
    caption: {
      maxLength: 2200,
      maxHashtags: 30,
    },
  },
  FACEBOOK: {
    photo: {
      minWidth: 320,
      maxWidth: 2048,
      aspectRatios: ["1:1", "4:5", "16:9", "2:3"],
      maxFileSize: 4 * 1024 * 1024, // 4MB
      formats: ["jpg", "jpeg", "png", "gif"],
    },
    video: {
      minWidth: 320,
      maxWidth: 1280,
      maxDuration: 240,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      formats: ["mp4", "mov", "avi"],
    },
    caption: {
      maxLength: 63206,
      maxHashtags: 50,
    },
  },
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validatePost(post: any, platforms: string[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Caption validation
  if (post.caption) {
    platforms.forEach((platform) => {
      const rules = PLATFORM_RULES[platform as keyof typeof PLATFORM_RULES]
      if (rules && post.caption.length > rules.caption.maxLength) {
        errors.push(`Caption too long for ${platform} (${post.caption.length}/${rules.caption.maxLength} characters)`)
      }

      // Hashtag validation
      const hashtags = (post.hashtags || "").split(" ").filter((tag: string) => tag.startsWith("#"))
      if (hashtags.length > rules.caption.maxHashtags) {
        errors.push(`Too many hashtags for ${platform} (${hashtags.length}/${rules.caption.maxHashtags})`)
      }
    })
  }

  // Scheduling conflict detection
  if (post.scheduledFor) {
    const scheduledTime = new Date(post.scheduledFor)
    const now = new Date()

    if (scheduledTime <= now) {
      errors.push("Scheduled time must be in the future")
    }

    // Check for conflicts (this would need to query existing posts)
    // For now, just a placeholder warning
    warnings.push("Remember to check for scheduling conflicts with other posts")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateAsset(file: File, platform: string, postType: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const rules = PLATFORM_RULES[platform as keyof typeof PLATFORM_RULES]
  if (!rules) {
    errors.push(`Unknown platform: ${platform}`)
    return { isValid: false, errors, warnings }
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")

  if (isImage && rules.photo) {
    if (!rules.photo.formats.includes(fileExtension || "")) {
      errors.push(`Invalid image format for ${platform}. Supported: ${rules.photo.formats.join(", ")}`)
    }
    if (file.size > rules.photo.maxFileSize) {
      errors.push(`Image too large for ${platform}. Max size: ${(rules.photo.maxFileSize / 1024 / 1024).toFixed(1)}MB`)
    }
  }

  if (isVideo && rules.video) {
    if (!rules.video.formats.includes(fileExtension || "")) {
      errors.push(`Invalid video format for ${platform}. Supported: ${rules.video.formats.join(", ")}`)
    }
    if (file.size > rules.video.maxFileSize) {
      errors.push(`Video too large for ${platform}. Max size: ${(rules.video.maxFileSize / 1024 / 1024).toFixed(1)}MB`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
