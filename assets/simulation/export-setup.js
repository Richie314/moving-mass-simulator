'use strict';
var TimeMax = new Decimal(1);
/**
 * 
 * @param {Simulation} sim 
 * @param {Decimal|number|string} max
 * @returns {object[][]}
 */
async function CalculateAll(sim, max)
{
    if (!Decimal.isDecimal(max))
    {
        max = new Decimal(max);
    }
    let arr = [];
    do {
        try {
            arr.push(await IterateAsync(sim, sim.dtCount));
        } catch {
            //End the export
            return arr;
        }
    } while (sim.elapsedTime.lessThan(max));
    return arr;
}
/**
 * 
 * @param {Simulation} sim 
 * @param {Decimal} count 
 */
async function IterateAsync(sim, count)
{
    if (!sim.executeIterations(count))
    {
        throw new Error('End export');
    }
    return [
        sim.tableMass.r.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.tableMass.rPrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.tableMass.rDoublePrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),

        sim.tableMass.theta.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.tableMass.thetaPrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.tableMass.thetaDoublePrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        
        sim.fallingMass.height.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.fallingMass.heightPrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        sim.fallingMass.heightDoublePrime.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN)
    ].map(elem => {
        return {
            t: 'n',
            v: elem,
            z: '0.00E+00'
        }
    })
}

async function Export ()
{
    pause();
    hideExport.disabled = true;
    exportBtn.innerHTML = '...';
    exportBtn.disabled = true;

    let my_sim = new Simulation(simulation.Engine, tableMass.clone(), fallingMass.clone(), null, null, TableMeasures, dtCount);
    const headerRows = [
        [
            {
                t: 's',
                v: 'm1:'
            },
            {
                t: 'n',
                v: my_sim.tableMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'm2:'
            },
            {
                t: 'n',
                v: my_sim.fallingMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'l:'
            },
            {
                t: 'n',
                v: my_sim.cable.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'k:'
            },
            {
                t: 'n',
                v: my_sim.k.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            }
        ],
        [
            {
                t: 's',
                v: 'R'
            },
            {
                t: 's',
                v: 'R.'
            },
            {
                t: 's',
                v: 'R..'
            },

            {
                t: 's',
                v: 'Theta'
            },
            {
                t: 's',
                v: 'Theta.'
            },
            {
                t: 's',
                v: 'Theta..'
            },

            {
                t: 's',
                v: 'h'
            },
            {
                t: 's',
                v: 'h.'
            },
            {
                t: 's',
                v: 'h..'
            },
        ]
    ];
    const footerRows = [
        [
            {
                t: 's',
                v: 'Generato tramite SheetJS'
            }
        ]
    ];
    const dataRows = await CalculateAll(my_sim, TimeMax);
    const allRows = headerRows.concat(dataRows, footerRows);
    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
    XLSX.writeFileXLSX(workbook, 'export.xlsx');

    hideExport.disabled = false;
    exportBtn.innerHTML = 'Esporta';
    exportBtn.disabled = false;
}
exportBtn.onclick = Export;