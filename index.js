// AESO Current Supply Demand Dashboard

// Copyright (c) 2024 Maxwell Power
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom
// the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
// AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// File: index.js

const axios = require('axios');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const cron = require('node-cron');
const { DateTime } = require('luxon');

// Environment Variables
const influxDBUrl = process.env.INFLUXDB_URL;
const influxDBToken = process.env.INFLUXDB_TOKEN;
const influxDBOrg = process.env.INFLUXDB_ORG;
const influxDBBucket = process.env.INFLUXDB_BUCKET;
const apiUrl = process.env.AESO_API_URL;
const apiKey = process.env.AESO_API_KEY;

// InfluxDB Client Setup
const influxDB = new InfluxDB({ url: influxDBUrl, token: influxDBToken });
const writeApi = influxDB.getWriteApi(influxDBOrg, influxDBBucket, 'ns');

// Function to Fetch and Store Data
async function fetchData() {
    try {
        console.log('Fetching data from API...');
        const response = await axios.get(apiUrl, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        console.log('Data fetched successfully:', response.data);
        const data = response.data.return;

        if (!data || !data.last_updated_datetime_utc) {
            console.error('Invalid data format:', response.data);
            return;
        }

        // Log the received timestamp for debugging
        console.log('Received timestamp (UTC):', data.last_updated_datetime_utc);

        // Parse the timestamp correctly
        const timestamp = DateTime.fromFormat(data.last_updated_datetime_utc, "yyyy-MM-dd HH:mm", { zone: 'utc' }).toJSDate();

        // Log the parsed timestamp for debugging
        console.log('Parsed timestamp:', timestamp);

        // General Grid Data
        const gridPoint = new Point('grid_data')
            .timestamp(timestamp)
            .intField('total_max_generation_capability', data.total_max_generation_capability)
            .intField('total_net_generation', data.total_net_generation)
            .intField('net_to_grid_generation', data.net_to_grid_generation)
            .intField('net_actual_interchange', data.net_actual_interchange)
            .intField('alberta_internal_load', data.alberta_internal_load)
            .intField('contingency_reserve_required', data.contingency_reserve_required)
            .intField('dispatched_contigency_reserve_total', data.dispatched_contigency_reserve_total)
            .intField('dispatched_contingency_reserve_gen', data.dispatched_contingency_reserve_gen)
            .intField('dispatched_contingency_reserve_other', data.dispatched_contingency_reserve_other)
            .intField('lssi_armed_dispatch', data.lssi_armed_dispatch)
            .intField('lssi_offered_volume', data.lssi_offered_volume)
            .intField('long_lead_time_volume', data.long_lead_time_volume);

        writeApi.writePoint(gridPoint);
        console.log('Grid data point written:', gridPoint);

        // Generation Data List
        if (data.generation_data_list && Array.isArray(data.generation_data_list)) {
            data.generation_data_list.forEach(genData => {
                const generationPoint = new Point('generation_data')
                    .timestamp(timestamp)
                    .tag('fuel_type', genData.fuel_type)
                    .intField('aggregated_maximum_capability', genData.aggregated_maximum_capability)
                    .intField('aggregated_net_generation', genData.aggregated_net_generation)
                    .intField('aggregated_dispatched_contingency_reserve', genData.aggregated_dispatched_contingency_reserve);

                writeApi.writePoint(generationPoint);
                console.log('Generation data point written:', generationPoint);
            });
        } else {
            console.error('Invalid generation data list:', data.generation_data_list);
        }

        // Interchange Data
        if (data.interchange_list && Array.isArray(data.interchange_list)) {
            data.interchange_list.forEach(interchange => {
                const interchangePoint = new Point('interchange_data')
                    .timestamp(timestamp)
                    .tag('path', interchange.path)
                    .intField('actual_flow', interchange.actual_flow);

                writeApi.writePoint(interchangePoint);
                console.log('Interchange data point written:', interchangePoint);
            });
        } else {
            console.error('Invalid interchange data list:', data.interchange_list);
        }

        await writeApi.flush();
        console.log('Data written to InfluxDB successfully');
    } catch (error) {
        console.error('Error fetching or storing data:', error.message);
    }
}

// Schedule the fetchData function to run at your desired interval
cron.schedule('* * * * *', fetchData); // Runs every minute

// Graceful Shutdown
const shutdown = async () => {
    try {
        await writeApi.close();
        console.log('InfluxDB write api closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
