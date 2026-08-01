import type { DataDictionaryField } from './types'
export const DATA_DICTIONARY: readonly DataDictionaryField[] = [
  { name: 'organizationId', displayName: 'Organization', description: 'Owning legal or operating organization.', dataType: 'reference', nullable: false, validation: 'non-empty ID', businessMeaning: 'Tenant boundary', owningModule: 'platform', referencedBy: ['all masters'] },
  { name: 'branchId', displayName: 'Branch', description: 'Operational branch when applicable.', dataType: 'reference', nullable: true, validation: 'authorized branch ID', businessMeaning: 'Operational scope', owningModule: 'platform', referencedBy: ['inventory', 'finance', 'sales'] },
  { name: 'code', displayName: 'Code', description: 'Human-recognizable unique master code.', dataType: 'string', nullable: false, validation: 'unique per domain and organization', businessMeaning: 'Stable business identifier', owningModule: 'master-data', referencedBy: ['all masters'] },
  { name: 'status', displayName: 'Status', description: 'Lifecycle state of the master record.', dataType: 'string', nullable: false, defaultValue: 'active', validation: 'controlled reference value', businessMeaning: 'Activation control', owningModule: 'master-data', referencedBy: ['all masters'] },
]
