Regenerate SSH keys (if ever needed):

```bash
ssh-keygen -t rsa -b 2048 -f terraform.id_rsa
```

# On AWS RDS

Using RDS would be great, but:

* Aurora Serverless v1 is soon EOL, and v2 can no longer scale to zero → would be expensive
* Smallest regular provisioned Postgres instance is eligible for free tier, but only for 1 year
* RDS instances must be placed in a VPC → so does the Lambda that connects to it (i.e. our backend)
* This requires a bastion to reach the DB from dev laptops; a tiny EC2 instance works for this, and is also free (for a year), but is extra setup
* Lambdas deployed into a VPC can't reach the internet (e.g. 3rd party APIs) without a NAT Gateway → expensive
* Sometimes suggested [workaround](https://medium.com/@fabriziodurso/aws-lambda-in-a-nutshell-how-to-access-internet-from-a-lambda-function-in-vpc-without-nat-gateway-5eb123ae5147) is to have another Lambda outside the VPC, which can reach the internet, to which you make calls from your original Lambda via a VPC Endpoint, but it would be an annoying complication to split the app
* [Recently](https://aws.amazon.com/about-aws/whats-new/2023/10/aws-lambda-ipv6-outbound-connections-vpc/), VPC-deployed Lambdas are able to use an egress-only IPv6 Internet Gateway, but our 3rd party APIs aren't IPv6
* You could set up an API Gateway to act as proxy, which would be slightly simpler than running another Lambda, but API Gateway [doesn't](https://www.reddit.com/r/aws/comments/11ruedw/ipv6_support_for_api_gateway/) support IPv6
* That could be worked around by putting CloudFront in front of API Gateway, but it's pretty ridiculous
* Using IPv6 egress from the Lambda sounds like it might be the solution with dual-stack RDS instances, but dual-stack instances [must](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html#USER_VPC.IP_addressing.dual-stack-limitations) be private
* Also some [suggest](https://www.reddit.com/r/aws/comments/14jkehy/can_i_use_api_gateway_to_avoid_the_need_for_a/) using VPC Endpoints to call API Gateway (and the aforementioned proxy hack), but VPC Endpoints are billed hourly → expensive

There's an almost-there implementation around 03fc857c, but eventually abandoned RDS, due to all of the above.
