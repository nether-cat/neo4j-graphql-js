import {
  isAddMutation,
  isCreateMutation,
  isUpdateMutation,
  isRemoveMutation,
  isDeleteMutation,
  getQueryCypherDirective,
  getMutationCypherDirective
} from './utils';
// Initial support for checking auth
import { parse } from 'graphql';
import {
  IsAuthenticatedDirective,
  HasRoleDirective,
  HasScopeDirective
} from 'graphql-auth-directives';
import { parseDirectiveSdl } from './utils';
/*
 *  Check is context.req.error or context.error
 *  have been defined.
 */
export const checkRequestError = context => {
  if (context && context.req && context.req.error) {
    return context.req.error;
  } else if (context && context.error) {
    return context.error;
  } else {
    return false;
  }
};
<<<<<<< HEAD

/*
 *  Call Access Control List factories
 *  injected into context object
 *  based on the type of Query/Mutation.
 */
export const getAccessControlParams = (context, resolveInfo) => {
  if (context == null || context.AccessControl == undefined) {
    return { matchStatements: '', mergeHeader: '', whereStatements: [] };
  } else {
    if (isMutation(resolveInfo)) {
      if (getMutationCypherDirective(resolveInfo)) {
        // Custom cypher directives can incorporate their own custom ACL
        return false;
      } else if (isCreateMutation(resolveInfo)) {
        // TODO: validate CreateMutation aclFactory output for use in nodeCreate
        return context.AccessControl.createMutation.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.createMutation.aclFactory(
              context,
              resolveInfo
            );
      } else if (isUpdateMutation(resolveInfo)) {
        // TODO: validate updateMutation aclFactory output for use in nodeUpdate
        return context.AccessControl.updateMutation.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.updateMutation.aclFactory(
              context,
              resolveInfo
            );
      } else if (isDeleteMutation(resolveInfo)) {
        // TODO: validate deleteMutation aclFactory output for use in nodeDelete
        return context.AccessControl.deleteMutation.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.deleteMutation.aclFactory(
              context,
              resolveInfo
            );
      } else if (isAddMutation(resolveInfo)) {
        // TODO: validate addRelationship aclFactory output for use in relationshipCreate
        return context.AccessControl.addRelationship.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.addRelationship.aclFactory(
              context,
              resolveInfo
            );
      } else if (isRemoveMutation(resolveInfo)) {
        // TODO: validate removeRelationship aclFactory output for use in relationshipDelete
        return context.AccessControl.removeRelationship.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.removeRelationship.aclFactory(
              context,
              resolveInfo
            );
      } else {
        // If unknown type of mutation, can't incorporate the ACL
        return false;
      }
    } else {
      if (getQueryCypherDirective(resolveInfo)) {
        // Custom cypher directives can incorporate their own custom ACL
        return false;
      } else {
        // TODO: validate nodeQuery aclFactory output for use in nodeQuery
        return context.AccessControl.nodeQuery.aclFactory == undefined
          ? { matchStatements: '', mergeHeader: '', whereStatements: [] }
          : context.AccessControl.nodeQuery.aclFactory(context, resolveInfo);
      }
    }
  }
};

export const shouldAddAuthDirective = (config, authDirective) => {
  if (config && typeof config === 'object') {
    return (
      config.auth === true ||
      (config &&
        typeof config.auth === 'object' &&
        config.auth[authDirective] === true)
    );
  }
  return false;
};

export const possiblyAddDirectiveDeclarations = (typeMap, config) => {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    typeMap['isAuthenticated'] = parse(
      `directive @isAuthenticated on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum is specified in typedefs
    typeMap['hasRole'] = parse(
      `directive @hasRole(roles: [Role]) on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  if (shouldAddAuthDirective(config, 'hasScope')) {
    typeMap['hasScope'] = parse(
      `directive @hasScope(scopes: [String]) on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  return typeMap;
};

export const possiblyAddDirectiveImplementations = (
  schemaDirectives,
  typeMap,
  config
) => {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    schemaDirectives['isAuthenticated'] = IsAuthenticatedDirective;
  }
  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum specified in typedefs
    schemaDirectives['hasRole'] = HasRoleDirective;
  }
  if (shouldAddAuthDirective(config, 'hasScope')) {
    schemaDirectives['hasScope'] = HasScopeDirective;
  }
  return schemaDirectives;
};

const getRoleType = typeMap => {
  const roleType = typeMap['Role'];
  if (!roleType) {
    throw new Error(
      `A Role enum type is required for the @hasRole auth directive.`
    );
  }
  return roleType;
};

export const possiblyAddScopeDirective = ({
  typeName,
  relatedTypeName,
  operationType,
  entityType,
  config
}) => {
  if (shouldAddAuthDirective(config, 'hasScope')) {
    if (entityType === 'node') {
      if (
        operationType === 'Create' ||
        operationType === 'Read' ||
        operationType === 'Update' ||
        operationType === 'Delete'
      ) {
        return parseDirectiveSdl(
          `@hasScope(scopes: ["${typeName}: ${operationType}"])`
        );
      }
    }
    if (entityType === 'relation') {
      if (operationType === 'Add') operationType = 'Create';
      else if (operationType === 'Remove') operationType = 'Delete';
      return `@hasScope(scopes: ["${typeName}: ${operationType}", "${relatedTypeName}: ${operationType}"])`;
    }
  }
  return undefined;
};
||||||| merged common ancestors
=======

export const shouldAddAuthDirective = (config, authDirective) => {
  if (config && typeof config === 'object') {
    return (
      config.auth === true ||
      (config &&
        typeof config.auth === 'object' &&
        config.auth[authDirective] === true)
    );
  }
  return false;
};

export const possiblyAddDirectiveDeclarations = (typeMap, config) => {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    typeMap['isAuthenticated'] = parse(
      `directive @isAuthenticated on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum is specified in typedefs
    typeMap['hasRole'] = parse(
      `directive @hasRole(roles: [Role]) on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  if (shouldAddAuthDirective(config, 'hasScope')) {
    typeMap['hasScope'] = parse(
      `directive @hasScope(scopes: [String]) on OBJECT | FIELD_DEFINITION`
    ).definitions[0];
  }
  return typeMap;
};

export const possiblyAddDirectiveImplementations = (
  schemaDirectives,
  typeMap,
  config
) => {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    schemaDirectives['isAuthenticated'] = IsAuthenticatedDirective;
  }
  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum specified in typedefs
    schemaDirectives['hasRole'] = HasRoleDirective;
  }
  if (shouldAddAuthDirective(config, 'hasScope')) {
    schemaDirectives['hasScope'] = HasScopeDirective;
  }
  return schemaDirectives;
};

const getRoleType = typeMap => {
  const roleType = typeMap['Role'];
  if (!roleType) {
    throw new Error(
      `A Role enum type is required for the @hasRole auth directive.`
    );
  }
  return roleType;
};

export const possiblyAddScopeDirective = ({
  typeName,
  relatedTypeName,
  operationType,
  entityType,
  config
}) => {
  if (shouldAddAuthDirective(config, 'hasScope')) {
    if (entityType === 'node') {
      if (
        operationType === 'Create' ||
        operationType === 'Read' ||
        operationType === 'Update' ||
        operationType === 'Delete'
      ) {
        return parseDirectiveSdl(
          `@hasScope(scopes: ["${typeName}: ${operationType}"])`
        );
      }
    }
    if (entityType === 'relation') {
      if (operationType === 'Add') operationType = 'Create';
      else if (operationType === 'Remove') operationType = 'Delete';
      return `@hasScope(scopes: ["${typeName}: ${operationType}", "${relatedTypeName}: ${operationType}"])`;
    }
  }
  return undefined;
};
>>>>>>> upstream/master
