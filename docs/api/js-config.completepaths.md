<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@apextoaster/js-config](./js-config.md) &gt; [completePaths](./js-config.completepaths.md)

## completePaths() function

With the given name, generate all potential config paths in their complete, absolute form.

This will include the value of `ISOLEX_HOME`<!-- -->, `HOME`<!-- -->, the current working directory, and any extra paths passed as the final arguments.

<b>Signature:</b>

```typescript
export declare function completePaths(name: string, basePaths: Array<string>, options: IncludeOptions): Array<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  name | string |  |
|  basePaths | Array&lt;string&gt; |  |
|  options | IncludeOptions |  |

<b>Returns:</b>

Array&lt;string&gt;

