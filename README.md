# ShareASale Node.JS Client - WIP

Only supports API v2.3

## Supported Actions
- `traffic`
- Rest are in progress


## Example Usage

`report.ts`

```typescript
import { ShareASale } from './dist/index'
async function main() {
    const ss = new ShareASale({
        affiliateId: 123456789,
        apiToken: 'abcdefghijk1234',
        apiSecretKey: 'abcdefghijklmnopqrstuvwxyz1234567890',
        apiVersion: 2.3
    })
 
    const res = await ss.getTraffic({
        dateStart: new Date('02/01/2020')
    })

    console.log(res)

    // [ 
    //     { 
    //         merchantId: '12345',
    //         organization: 'SameVendor',
    //         website: 'www.example.com',
    //         uniqueHits: '100',
    //         commissions: '$10.00',
    //         netSales: '$10.00',
    //         numberOfVoids: '0',
    //         numberOfSales: '0',
    //         conversion: '10.00%',
    //         epc: '$0.00' 
    //     },
    //     ...
    // ]
    
}

main()
```