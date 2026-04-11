provider "local" {}

resource "local_file" "project_info" {
  content = <<EOF
DevOps Project: VSR Builders

Components:
- Frontend (React)
- Task Service (Node.js)
- User Service (Node.js)

Tools Used:
- Docker
- Kubernetes
- GitHub Actions
- Terraform
- Ansible

Status: Successfully Deployed
EOF

  filename = "${path.module}/project_info.txt"
}