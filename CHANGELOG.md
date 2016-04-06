# luno-node changelog

## [1.0.5](https://github.com/lunoio/luno-node/tree/v1.0.5) (2016-04-06)
[Compare](https://github.com/lunoio/luno-node/compare/v1.0.4...v1.0.5)

- Sandbox Mode can now be configured for all requests and overridden per-request, rather than having to be specified on every request.

## [1.0.4](https://github.com/lunoio/luno-node/tree/v1.0.4) (2016-03-30)
[Compare](https://github.com/lunoio/luno-node/compare/v1.0.3...v1.0.4)

- Routes can now include `/v1` prefix without resulting in a `route_not_found` error ([\#1](https://github.com/lunoio/luno-node/issues/1))

## [1.0.3](https://github.com/lunoio/luno-node/tree/v1.0.3) (2016-03-21)
[Compare](https://github.com/lunoio/luno-node/compare/v1.0.2...v1.0.3)

- Errors now have a `description` property, which is returned by the API to supplement the `message` with more details.

## [1.0.2](https://github.com/lunoio/luno-node/tree/v1.0.2) (2016-02-29)
[Compare](https://github.com/lunoio/luno-node/compare/v1.0.1...v1.0.2)

- Added [Session middleware](https://github.com/lunoio/luno-node/tree/v1.0.2#middleware) to easily run `/sessions/access` code, setting `req.session` with the current active session for a user.

## [1.0.1](https://github.com/lunoio/luno-node/tree/v1.0.1) (2016-02-09)
[Compare](https://github.com/lunoio/luno-node/compare/v1.0.0...v1.0.1)

- Fixed HMAC signatures for requests that include UTF-8 characters (e.g. emoji).

## [1.0.0](https://github.com/lunoio/luno-node/tree/v1.0.0) (2016-02-08)

- Initial release
