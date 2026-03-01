# Main Terraform configuration for Farmer Decision Support Platform

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "farmer-platform-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "farmer-platform-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "FarmerDecisionSupport"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
