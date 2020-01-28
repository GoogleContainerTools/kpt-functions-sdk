[@googlecontainertools/kpt-functions](../README.md) › ["types"](../modules/_types_.md) › [KptFunc](_types_.kptfunc.md)

# Interface: KptFunc

Interface describing KPT functions.

## Hierarchy

* **KptFunc**

## Callable

▸ (`configs`: [Configs](../classes/_types_.configs.md)): *Promise‹void›*

A function consumes and optionally mutates Kubernetes configurations using the given [Configs](../classes/_types_.configs.md) object.

The function should:
- Throw a [ConfigError](../classes/_errors_.configerror.md) when encountering one or more configuration-related issues.
- Throw other error types when encountering operational issues such as IO exceptions.
- Avoid writing to stdout (e.g. using process.stdout) as it is used for chaining functions.
  Use stderr instead.

**Parameters:**

Name | Type |
------ | ------ |
`configs` | [Configs](../classes/_types_.configs.md) |

**Returns:** *Promise‹void›*

## Index

### Properties

* [usage](_types_.kptfunc.md#usage)

## Properties

###  usage

• **usage**: *string*

Usage message describing what the function does, how to use it, and how to configure it.
