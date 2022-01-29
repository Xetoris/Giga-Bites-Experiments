# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 01-29-2022

Bug Fixes.

### Added
- Changelog.

### Changed
- Initial RegExp for parsing tip amount was getting thrown by white spaces in formatting. Stripping all whitespaces
before attempting the Regex matching.
- Changed generated query to include label filter.
- Forgot to wire up logger everywhere in google client methods. Fixed.
- Switched the output of the AuthUrl to be part of the readline question for the generated access code.


## [0.0.1] - 01-27-2022

Initial Version

### Added
- Helper for interacting w/ Google Mail API.
- Functions for scraping the email contents.
- Date functions for generating email search query.
- LogLevel package for generating output.
- Some unit tests (WIP).