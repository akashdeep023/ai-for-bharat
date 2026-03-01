# S3 buckets for content storage

# Content bucket for training videos, images, and documents
resource "aws_s3_bucket" "content" {
  bucket = "${var.project_name}-content-${var.environment}"

  tags = {
    Name = "${var.project_name}-content-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "content" {
  bucket = aws_s3_bucket.content.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "content" {
  bucket = aws_s3_bucket.content.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "content" {
  bucket = aws_s3_bucket.content.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "content" {
  bucket = aws_s3_bucket.content.id

  rule {
    id     = "archive-old-content"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER"
    }
  }
}

# User data bucket
resource "aws_s3_bucket" "user_data" {
  bucket = "${var.project_name}-user-data-${var.environment}"

  tags = {
    Name = "${var.project_name}-user-data-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "user_data" {
  bucket = aws_s3_bucket.user_data.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "user_data" {
  bucket = aws_s3_bucket.user_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "user_data" {
  bucket = aws_s3_bucket.user_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
