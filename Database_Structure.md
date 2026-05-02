TargetFile: c:\Users\anish\Desktop\LeetCode\Database_Structure.md
Overwrite: true
IsArtifact: true
ArtifactMetadata:
  ArtifactType: walkthrough
  Summary: A detailed breakdown of the MongoDB database structure for the LeetCode project, including internal system databases and application-specific collections.
  RequestFeedback: false
Description: Created a detailed database structure documentation with diagrams.
CodeContent: |
  # MongoDB Database Structure Guide

  This document explains the internal and application-specific structure of your MongoDB instance.

  ## 1. High-Level Overview
  MongoDB uses "Databases" to group "Collections" (Tables).

  ```mermaid
  graph TD
      Instance[MongoDB Instance]
      Instance --> admin[admin DB]
      Instance --> config[config DB]
      Instance --> local[local DB]
      Instance --> judge[judge DB - YOUR PROJECT]

      admin --> admin_info[System Roles & Users]
      config --> config_info[Internal Config]
      local --> local_info[Replication Logs]

      judge --> users[users collection]
      judge --> problems[problems collection]
      judge --> submissions[submissions collection]
      judge --> contests[contests collection]
