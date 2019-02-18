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

/*
*  Call Access Control List factories
*  injected into context object
*  based on the type of Query/Mutation.
*/
export const getAccessControlPredicates = (context, resolveInfo) => {
  if (isMutation(resolveInfo)) {
    if (getMutationCypherDirective(resolveInfo)) {
      // Custom cypher directives can incorporate their own custom ACL
      return false;
    } else if (isCreateMutation(resolveInfo)) {
      // TODO: validate CreateMutation aclFactory output for use in nodeCreate
      return context.AccessControl.createMutation.aclFactory(context, resolveInfo);
    } else if (isUpdateMutation(resolveInfo)) {
      // TODO: validate updateMutation aclFactory output for use in nodeUpdate
      return context.AccessControl.updateMutation.aclFactory(context, resolveInfo);
    } else if (isDeleteMutation(resolveInfo)) {
      // TODO: validate deleteMutation aclFactory output for use in nodeDelete
      return context.AccessControl.deleteMutation.aclFactory(context, resolveInfo);
    } else if (isAddMutation(resolveInfo)) {
      // TODO: validate addRelationship aclFactory output for use in relationshipCreate
      return context.AccessControl.addRelationship.aclFactory(context, resolveInfo);
    } else if (isRemoveMutation(resolveInfo)) {
      // TODO: validate removeRelationship aclFactory output for use in relationshipDelete
      return context.AccessControl.removeRelationship.aclFactory(context, resolveInfo);
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
      return context.AccessControl.nodeQuery.aclFactory(context, resolveInfo);
    }
  }
};