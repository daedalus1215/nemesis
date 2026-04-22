/**
 * Dependency Cruiser Configuration
 *
 * This file defines architectural rules using dependency-cruiser to enforce
 * our Domain-Driven Design and Hexagonal Architecture patterns.
 *
 * Location: Root level (standard for dependency-cruiser configs)
 * Loaded via: load-depcruise-config.js (ts-node bridge)
 *
 * Usage:
 *   npx depcruise --config load-depcruise-config.js src
 *   npm run test:architecture
 *
 * This TypeScript configuration provides full type safety and IntelliSense
 * support for the dependency-cruiser rules.
 */

import type { IConfiguration } from 'dependency-cruiser';

const config: IConfiguration = {
	forbidden: [
		// Converters Rules
		{
			name: 'converters-no-repositories',
			comment: 'Converters should not depend on repositories',
			severity: 'error',
			from: {
				path: '.*\\.converter\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '^src/.*/repositories/.*' },
		},
		{
			name: 'converters-no-other-converters',
			comment:
				'Converters should not depend on other converters (same-level injection forbidden)',
			severity: 'error',
			from: {
				path: '.*\\.converter\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: {
				path: '.*\\.converter\\.ts$',
			},
		},
		{
			name: 'converters-no-transaction-scripts',
			comment: 'Converters should not depend on transaction scripts',
			severity: 'error',
			from: { path: '.*\\.converter\\.ts$' },
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'converters-no-services',
			comment: 'Converters should not depend on domain services',
			severity: 'error',
			from: { path: '.*\\.converter\\.ts$' },
			to: { path: '.*\\.service\\.ts$' },
		},
		{
			name: 'converters-no-mappers',
			comment: 'Converters should not depend on mappers',
			severity: 'error',
			from: { path: '.*\\.converter\\.ts$' },
			to: { path: '.*\\.mapper\\.ts$' },
		},
		{
			name: 'converters-no-assemblers',
			comment: 'Converters should not depend on assemblers',
			severity: 'error',
			from: { path: '.*\\.converter\\.ts$' },
			to: { path: '.*\\.assembler\\.ts$' },
		},

		// Assemblers Rules
		{
			name: 'assemblers-no-other-assemblers',
			comment: 'Assemblers should not depend on other assemblers',
			severity: 'error',
			from: {
				path: '.*\\.assembler\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '.*\\.assembler\\.ts$' },
		},
		{
			name: 'assemblers-no-transaction-scripts',
			comment: 'Assemblers should not depend on transaction scripts',
			severity: 'error',
			from: { path: '.*\\.assembler\\.ts$' },
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'assemblers-no-services',
			comment: 'Assemblers should not depend on domain services',
			severity: 'error',
			from: { path: '.*\\.assembler\\.ts$' },
			to: { path: '.*\\.service\\.ts$' },
		},
		{
			name: 'assemblers-no-mappers',
			comment: 'Assemblers should not depend on mappers',
			severity: 'error',
			from: { path: '.*\\.assembler\\.ts$' },
			to: { path: '.*\\.mapper\\.ts$' },
		},

		// Mappers Rules
		{
			name: 'mappers-no-other-mappers',
			comment: 'Mappers should not depend on other mappers',
			severity: 'error',
			from: {
				path: '.*\\.mapper\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '.*\\.mapper\\.ts$' },
		},
		{
			name: 'mappers-no-transaction-scripts',
			comment: 'Mappers should not depend on transaction scripts',
			severity: 'error',
			from: { path: '.*\\.mapper\\.ts$' },
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'mappers-no-services',
			comment: 'Mappers should not depend on domain services',
			severity: 'error',
			from: { path: '.*\\.mapper\\.ts$' },
			to: { path: '.*\\.service\\.ts$' },
		},

		// Transaction Scripts Rules
		{
			name: 'transaction-scripts-no-other-transaction-scripts',
			comment:
				'Transaction scripts should not depend on other transaction scripts',
			severity: 'error',
			from: {
				path: '.*\\.transaction\\.script\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'transaction-scripts-no-services',
			comment: 'Transaction scripts should not depend on domain services',
			severity: 'error',
			from: { path: '.*\\.transaction\\.script\\.ts$' },
			to: { path: '.*\\.service\\.ts$' },
		},

		// Domain Services Rules
		{
			name: 'services-no-other-services',
			comment:
				'Domain services should not depend on other domain services',
			severity: 'error',
			from: {
				path: '.*domain/services/.*\\.service\\.ts$',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '.*domain/services/.*\\.service\\.ts$' },
		},
		{
			name: 'services-no-mappers',
			comment: 'Domain services should not depend on mappers directly',
			severity: 'error',
			from: {
				path: '.*domain/services/.*\\.service\\.ts$',
				pathNot: 'app/app-service',
			},
			to: { path: '.*\\.mapper\\.ts$' },
		},
		{
			name: 'services-no-assemblers',
			comment: 'Domain services should not depend on assemblers directly',
			severity: 'error',
			from: {
				path: '.*domain/services/.*\\.service\\.ts$',
				pathNot: 'app/app-service',
			},
			to: { path: '.*\\.assembler\\.ts$' },
		},
		{
			name: 'services-no-converters',
			comment: 'Domain services should not depend on converters directly',
			severity: 'error',
			from: {
				path: '.*domain/services/.*\\.service\\.ts$',
				pathNot: 'app/app-service',
			},
			to: { path: '.*\\.converter\\.ts$' },
		},

		// App Services Rules
		{
			name: 'app-services-no-other-app-services',
			comment:
				'App services should not depend on other app services',
			severity: 'error',
			from: {
				path: '.*app/app-service/.*',
				pathNot: '(__specs__|__spec__)',
			},
			to: { path: '.*app/app-service/.*' },
		},
		{
			name: 'app-services-no-repositories',
			comment:
				'App services should not depend on repositories. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*repositories.*' },
		},
		{
			name: 'app-services-no-transaction-scripts',
			comment:
				'App services should not depend on transaction scripts. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'app-services-no-aggregators',
			comment:
				'App services should not depend on aggregators. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*aggregator.*' },
		},
		{
			name: 'app-services-no-mappers',
			comment:
				'App services should not depend on mappers. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*\\.mapper\\.ts$' },
		},
		{
			name: 'app-services-no-assemblers',
			comment:
				'App services should not depend on assemblers. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*\\.assembler\\.ts$' },
		},
		{
			name: 'app-services-no-converters',
			comment:
				'App services should not depend on converters. Use domain services instead.',
			severity: 'error',
			from: { path: '.*app/app-service/.*' },
			to: { path: '.*\\.converter\\.ts$' },
		},

		// Aggregators Rules
		{
			name: 'aggregators-no-other-aggregators',
			comment: 'Aggregators should not depend on other aggregators',
			severity: 'error',
			from: {
				path: '.*aggregator.*',
				pathNot: '(__specs__|__spec__)',
			},
			to: {
				path: '.*aggregator.*',
				pathNot: '(\\.port|port\\.)', // Allow ports/interfaces - aggregators can implement ports
			},
		},
		{
			name: 'aggregators-no-services',
			comment: 'Aggregators should not depend on domain services',
			severity: 'error',
			from: { path: '.*aggregator.*' },
			to: { path: '.*\\.service\\.ts$' },
		},

		// Repositories Rules
		{
			name: 'repositories-no-transaction-scripts',
			comment: 'Repositories should not depend on transaction scripts',
			severity: 'error',
			from: { path: '.*repositories.*' },
			to: { path: '.*\\.transaction\\.script\\.ts$' },
		},
		{
			name: 'repositories-no-services',
			comment: 'Repositories should not depend on domain services',
			severity: 'error',
			from: { path: '.*repositories.*' },
			to: { path: '.*\\.service\\.ts$' },
		},
		{
			name: 'repositories-no-converters',
			comment: 'Repositories should not depend on converters',
			severity: 'error',
			from: { path: '.*repositories.*' },
			to: { path: '.*\\.converter\\.ts$' },
		},
		{
			name: 'repositories-no-assemblers',
			comment: 'Repositories should not depend on assemblers',
			severity: 'error',
			from: { path: '.*repositories.*' },
			to: { path: '.*\\.assembler\\.ts$' },
		},
		{
			name: 'repositories-no-mappers',
			comment: 'Repositories should not depend on mappers',
			severity: 'error',
			from: { path: '.*repositories.*' },
			to: { path: '.*\\.mapper\\.ts$' },
		},

		// Domain Boundaries
		{
			name: 'cases-entities-no-records-entities',
			comment: 'Cases entities should not depend on records entities',
			severity: 'error',
			from: { path: '.*cases.*entities.*' },
			to: { path: '.*records.*entities.*' },
		},
		{
			name: 'records-entities-no-cases-entities',
			comment: 'Records entities should not depend on cases entities',
			severity: 'error',
			from: { path: '.*records.*entities.*' },
			to: { path: '.*cases.*entities.*' },
		},

		// Layer Dependencies
		{
			name: 'infrastructure-no-application',
			comment: 'Infrastructure should not depend on application layer',
			severity: 'error',
			from: { path: '.*infrastructure.*' },
			to: { path: '.*application.*' },
		},
		{
			name: 'domain-no-application',
			comment: 'Domain should not depend on application layer',
			severity: 'error',
			from: { path: '.*domain.*' },
            to: { path: '.*\\.application\\.ts$' },
		},
	],
	options: {
		includeOnly: '^src',
		doNotFollow: {
			path: 'node_modules',
		},
		// Exclude test files from analysis
		exclude: {
			path: '(__specs__|__spec__)',
		},
		// Enable TypeScript parsing - this tells dependency-cruiser to parse
		// TypeScript files and resolve imports using the TypeScript compiler
		tsPreCompilationDeps: true,
	},
};

// Export as CommonJS for dependency-cruiser compatibility
// This file is loaded via load-depcruise-config.js which uses ts-node
export default config;
module.exports = config;