module "router" {
  source             = "./router"
  router_domain_name = "router.nightbear.fi"
  router_domain_zone = "${aws_route53_zone.main.zone_id}"
}
