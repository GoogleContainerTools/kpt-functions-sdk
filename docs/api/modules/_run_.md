[@googlecontainertools/kpt-functions](../README.md) › ["run"](_run_.md)

# External module: "run"

## Index

### Functions

* [run](_run_.md#run)

## Functions

###  run

▸ **run**(`fn`: [KptFunc](../interfaces/_types_.kptfunc.md)): *Promise‹void›*

This is the main entrypoint for running a KPT function.

This method does not throw any errors and can be invoked at the top-level without getting
an unhandled promise rejection error.

**Parameters:**

Name | Type |
------ | ------ |
`fn` | [KptFunc](../interfaces/_types_.kptfunc.md) |

**Returns:** *Promise‹void›*
