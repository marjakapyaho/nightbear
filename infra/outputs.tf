output "resources" {
  description = "Names/ID's of resources created; can be used for e.g. monitoring, or attaching external resources"
  value = {
    stage = module.stage.resources
  }
}
