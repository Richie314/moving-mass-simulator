self.importScripts(
    'https://unpkg.com/decimal.js@latest/decimal.js',
    './vectors.js',
    './masses.js',
    './engine/base.js',
    './engine/taylor.js',
    './engine/runge-kutta-nistrom.js',
    './simulation.js',
    'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
    //'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.6/xlsx.full.min.js'
);

/**
 * @param {any} obj the object to repeat
 * @param {number} count the times to repeat obj
 * @returns {any[]} an array like [obj, obj, ..., obj] count times
 */
function repeat(obj, count)
{
    let arr = [];
    for (let i = 0; i < count; i++)
    {
        arr.push(obj);
    }
    return arr;
}

function UpdateExport(id, string)
{
    const obj = {
        simulation: id,
        action: 'status-update',
        message: string
    };
    self.postMessage(JSON.stringify(obj));
}

function ErrorExport(id, string)
{
    const obj = {
        simulation: id,
        action: 'error-report',
        message: string
    };
    self.postMessage(JSON.stringify(obj));
}

function SimulationEnd(id)
{
    const obj = {
        simulation: id,
        action: 'simulation-end'
    };
    self.postMessage(JSON.stringify(obj));
}

function SimulationStart(id)
{
    const obj = {
        simulation: id,
        action: 'simulation-start'
    };
    self.postMessage(JSON.stringify(obj));
}

function SendFile(id, data)
{
    const obj = {
        simulation: id,
        action: 'send-file',
        file: data
    };
    self.postMessage(JSON.stringify(obj));
}

/**
 * @param {Decimal} elem 
 */
function mapDataFunction(elem)
{
    return {
        t: 'n',
        v: elem.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
        z: '0.000E+00'
    }
}

/**
 * @param {Simulation} s 
 */
function getDataFunction(s)
{
    return [
        s.elapsedTime,//A

        s.tableMass.r, //B
        s.tableMass.rPrime, //C
        s.tableMass.rDoublePrime, //D

        s.tableMass.theta, //E
        s.tableMass.thetaPrime, //F
        s.tableMass.thetaDoublePrime, //G
        
        s.fallingMass.height, //H
        s.fallingMass.heightPrime, //I
        s.fallingMass.heightDoublePrime, //J

        //Fillers to set cell format to EXCEL calculated data
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0)
    ];
}

const tableHeaders = [
    {
        t: 's',
        v: 'Timestamp [s]'
    },
    {
        t: 's',
        v: 'R [m]'
    },
    {
        t: 's',
        v: 'R\' [m/s]'
    },
    {
        t: 's',
        v: 'R\'\' [m/s^2]'
    },

    {
        t: 's',
        v: 'Theta [rad]'
    },
    {
        t: 's',
        v: 'Theta\' [rad/s]'
    },
    {
        t: 's',
        v: 'Theta\'\' [rad/s^2]'
    },

    {
        t: 's',
        v: 'h [m]'
    },
    {
        t: 's',
        v: 'h\' [m/s]'
    },
    {
        t: 's',
        v: 'h\'\' [m/s^2]'
    },

    {
        t: 's',
        v: 'l [m]'
    },
    {
        t: 's',
        v: 'Momentum [J/s]'
    },

    {
        t: 's',
        v: 'T1 [J]'
    },
    {
        t: 's',
        v: 'T2 [J]'
    },
    {
        t: 's',
        v: 'Ug [J]'
    },
    {
        t: 's',
        v: 'Uk [J]'
    },
    {
        t: 's',
        v: 'T+U [J]'
    },
    {
        t: 's',
        v: 'T-U [J]'
    },
];

class ExportRunning
{
    /**
     * @param {number} id The numeric ID of the export
     * @param {Simulation} sim The simulation to run
     * @param {Decimal|number} timeMax The maxinum time to reach
     */
    constructor(id, sim, timeMax)
    {
        this.id = Number(id);
        this.sim = sim;
        if (!Decimal.isDecimal(timeMax))
        {
            timeMax = new Decimal(timeMax);
        }
        this.timeMax = timeMax;
        this.isRunning = false;
        this.stop = false;
    }

    Update(percentage)
    {
        UpdateExport(this.id, 'Progresso: ' + (percentage * 100).toFixed(2) + '%');
    }

    Error(err)
    {
        ErrorExport(this.id, err);
    }

    Success()
    {
        SimulationEnd(this.id);
    }

    End(array)
    {
        const allRows = [
            [
                {
                    t: 's',
                    v: 'm1 [kg]'
                },
                {
                    t: 'n',
                    v: this.sim.tableMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                    z: '0.00E+00'
                },
                {
                    t: 's',
                    v: 'm2 [kg]'
                },
                {
                    t: 'n',
                    v: this.sim.fallingMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                    z: '0.00E+00'
                },
                {
                    t: 's',
                    v: 'l [m]'
                },
                {
                    t: 'n',
                    v: this.sim.springRelaxLenght.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                    z: '0.00E+00'
                },
                {
                    t: 's',
                    v: 'k [N/m]'
                },
                {
                    t: 'n',
                    v: this.sim.k.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                    z: '0.00E+00'
                },
                {
                    t: 's',
                    v: 'g [m/s^2]'
                },
                {
                    t: 'n',
                    v: g.toSignificantDigits(5, Decimal.ROUND_HALF_EVEN)
                },
                {
                    t: 's',
                    v: 'dt [s]'
                },
                {
                    t: 'n',
                    v: this.sim.dt.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN)
                },
                {
                    t: 's',
                    v: 'Peso accelerazione'
                },
                {
                    t: 'n',
                    v: this.sim.cavalieriWeight.toSignificantDigits(3, Decimal.ROUND_HALF_EVEN)
                }
            ],
            tableHeaders
        ].concat(array);
        this.isRunning = false;
        this.GenerateAndSaveExcel(allRows);
    }

    /**
     * @param {any[][]} allRows 
     */
    GenerateAndSaveExcel(allRows)
    {
        /**
         * @param {string} letter 
         * @returns {string}
         */
        function matr(letter)
        {
            return `${letter}3:${letter + String(allRows.length)}`;
        }
        
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);
        worksheet[matr('K')] = {}
        XLSX.utils.sheet_set_array_formula(worksheet, matr('K'), matr('B') + '-' + matr('H'));
        XLSX.utils.sheet_set_array_formula(worksheet, matr('L'), `B1 * POWER(${matr('B')}, 2) * ${matr('F')}`);
        
        XLSX.utils.sheet_set_array_formula(worksheet, matr('M'), `0.5 * B1 * (POWER(${matr('C')}, 2) + POWER(${matr('B')}*${matr('F')}, 2))`);
        XLSX.utils.sheet_set_array_formula(worksheet, matr('N'), `0.5 * D1 * POWER(${matr('I')}, 2)`);
        XLSX.utils.sheet_set_array_formula(worksheet, matr('O'), `J1 * D1 * ${matr('H')}`);
        XLSX.utils.sheet_set_array_formula(worksheet, matr('P'), `0.5 * H1 * POWER(${matr('K')} - F1, 2)`);
        
        XLSX.utils.sheet_set_array_formula(worksheet, matr('Q'), [matr('M'), matr('N'), matr('O'), matr('P')].join(" + "));
        XLSX.utils.sheet_set_array_formula(worksheet, matr('R'), `${matr('M')}+${matr('N')}-${matr('O')}-${matr('P')}`);
        
        worksheet["!cols"] = repeat({
            wch: 12
        }, 18);//Enlarge width for a better view of the table

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Simulazione");
        
        if (!workbook.Props) 
            workbook.Props = {};
        
            workbook.Props.Title = "Export dati simulazione";
        SendFile(this.id, XLSX.writeXLSX(workbook, {
            type: 'base64', compression: true
        }));
        
        //SendFile( this.id, allRows );
    }

    Abort()
    {
        this.stop = true;
    }

    async Calculate()
    {
        let arr = [
            getDataFunction(this.sim).map(mapDataFunction)
        ];
        SimulationStart(this.id);
        this.isRunning = true;
        await this.Iterate(arr, this.timeMax, this.sim.dtCount);
    }

    /**
     * @param {any[]} arr 
     * @param {Decimal} timeMax 
     * @param {Decimal|number} count 
     */
    async Iterate(arr, timeMax, count)
    {
        if (this.stop)
        {
            this.Error('Simulazione annullata!');
            return;
        }
        if (!this.sim.elapsedTime.lessThan(timeMax))
        {
            this.Success();
            this.End(arr);
            return;
        }
        if (!this.sim.executeIterations(count))
        {
            this.Error('Errore avvenuto: simulazione terminata!');
            this.End(arr);
            return;
        }
        arr.push( getDataFunction(this.sim).map(mapDataFunction) );
        this.Update( this.sim.elapsedTime.div(timeMax).toNumber() );
        await this.Iterate(arr, timeMax, count);
    }
}
let export_id = 1;
const exports = {};
function StartExport(obj)
{
    const tableMass = new MassRotatingObject(
        obj.table.mass,
        new PolarVector(
            obj.table.r,
            obj.table.t
        ),
        new PolarVector(
            obj.table.r1,
            obj.table.t1
        ),
        new PolarVector(
            obj.table.r2,
            obj.table.t2
        )
    );
    const fallingMass = new MassFallingObject(
        obj.table.mass,
        new Vector3(
            0, 0, obj.falling.h
        ),
        new Vector3(
            0, 0, obj.falling.h1
        ),
        new Vector3(
            0, 0, obj.falling.h2
        )
    );
    const dt = obj.dt;
    const cavalieriWeight = obj.cavalieriWeight;
    const springRelaxLength = obj.cable;
    const springConstant = obj.k;
    const Engines = [
        new TaylorEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt, cavalieriWeight),
        new TaylorEngine3(springRelaxLength, springConstant, dt, cavalieriWeight),
        new RungeKuttaNistromEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt),
        new RungeKuttaNistromEngine3(springRelaxLength, springConstant, dt)
    ];
    const engineName = obj.engine;
    let Engine = null;
    for (const engine of Engines)
    {
        if (engine.name === engineName)
        {
            Engine = engine;
            break;
        }
    }

    if (!Engine)
    {
        return;
    }

    const dtExportCount = obj.exportFreq;
    const sim = new Simulation(
        Engine, 
        tableMass, fallingMass, 
        null, null,
        new Vector3(), dtExportCount);
    const timeMax = obj.timeMax;
    const curr_export = new ExportRunning(export_id++, sim, timeMax);
    exports[curr_export.id] = curr_export;
    curr_export.Calculate().then(() => console.log('Calcolo simulazione terminato'));
}

self.onmessage = msg => {
    const obj = JSON.parse(msg.data);
    if ('startSimulation' in obj)
    {
        StartExport(obj);
        return;
    }
    if ('stopSimulation' in obj)
    {
        const id = Number(obj.id);
        if (exports[id] && exports[id].isRunning)
        {
            exports[id].Abort();
            delete exports[id];
        }
        return;
    }
}