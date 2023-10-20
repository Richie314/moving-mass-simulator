self.importScripts(
    'https://unpkg.com/decimal.js@latest/decimal.js',
    '../vectors.js',
    '../masses.js',
    '../engine/base.js',
    '../engine/taylor.js',
    '../engine/runge-kutta-euler.js',
    '../engine/runge-kutta-nistrom.js',
    '../simulation.js',
    './utils.js'
);
'use strict';
try {
    //This may causa a NetworkError
    self.importScripts('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js');
} catch(err) {
    console.warn(err);
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
        if (!hasXLSX()) //XLSX library failed to load
        {
            console.log('Worker does not have XLSX library loaded. It will send the json to the main thread for file creation');
            SendFile(this.id, allRows);
            return;
        }
        const workbook = GenerateWorkBook(allRows)
        const file_string = WorkBookToString(workbook);
        console.log('Worker will send the file as BASE64 to the main thread to save it');
        SendFile(this.id, file_string);
    }

    Abort()
    {
        console.log('Simulazione #' + this.id + ' annullata!')
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
    async Iterate(arr, timeMax, count, countDelay = 0)
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
        if (++countDelay === 5)
        {
            //Necessary for keeping the communication with the main thread open and not filled with junk updates
            await this.delay(2);
            this.Update( this.sim.elapsedTime.div(timeMax).toNumber() );
            countDelay = 0;
        }
        if (!this.sim.executeIterations(count))
        {
            this.Error('Errore avvenuto: simulazione terminata!');
            this.End(arr);
            return;
        }
        arr.push( getDataFunction(this.sim).map(mapDataFunction) );
        await this.Iterate(arr, timeMax, count, countDelay);
    }
    async delay(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
let export_id = 1;
const exports = {};
function StartExport(obj)
{
    console.log(obj);
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
        obj.falling.mass,
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

        new EulerEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt),
        new EulerEngine3(springRelaxLength, springConstant, dt),

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
        console.warn('Engine not found!');
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
        console.log('Stopping simulation #' + id)
        if (exports[id] && exports[id].isRunning)
        {
            exports[id].Abort();
            delete exports[id];
        }
        return;
    }
}