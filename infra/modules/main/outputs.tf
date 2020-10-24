output "resources" {
  description = "Names/ID's of resources created; can be used for e.g. monitoring, or attaching external resources"
  value = {
    ui = module.ui
  }
}
