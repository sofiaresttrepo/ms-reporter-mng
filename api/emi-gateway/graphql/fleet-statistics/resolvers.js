module.exports = {
  //// QUERY RESOLVERS ////
  Query: {
    getFleetStatistics(root, args, context) {
      return context.broker.forwardAndGetReply$(
        'VehicleStats', 
        'emigateway.graphql.query.GetFleetStatistics',
        { root, args, jwt: context.encodedToken },
        2000
      ).toPromise().then(result => {
        // If no data exists, return a default structure
        if (!result) {
          return {
            _id: 'fleet-statistics',
            totalVehicles: 0,
            totalHorsepower: 0,
            averageHorsepower: 0,
            typeCount: {},
            powerSourceCount: {},
            decadeCount: {},
            lastUpdated: new Date(),
            lastBatchSize: 0
          };
        }
        return result;
      });
    }
  },

  //// FIELD RESOLVERS ////
  FleetStatistics: {
    // Transform the MongoDB document to match GraphQL schema
    _id: (parent) => parent._id || 'fleet-statistics',
    totalVehicles: (parent) => parent.totalVehicles || 0,
    totalHorsepower: (parent) => parent.totalHorsepower || 0,
    averageHorsepower: (parent) => parent.averageHorsepower || 0,
    lastUpdated: (parent) => parent.lastUpdated && parent.lastUpdated.toISOString() || new Date().toISOString(),
    lastBatchSize: (parent) => parent.lastBatchSize || 0,
    
    typeCount: (parent) => ({
      sedan: (parent.typeCount && parent.typeCount.sedan) || 0,
      suv: (parent.typeCount && parent.typeCount.suv) || 0,
      truck: (parent.typeCount && parent.typeCount.truck) || 0,
      coupe: (parent.typeCount && parent.typeCount.coupe) || 0,
      hatchback: (parent.typeCount && parent.typeCount.hatchback) || 0,
      convertible: (parent.typeCount && parent.typeCount.convertible) || 0,
      wagon: (parent.typeCount && parent.typeCount.wagon) || 0,
      unknown: (parent.typeCount && parent.typeCount.unknown) || 0
    }),
    
    powerSourceCount: (parent) => ({
      gasoline: (parent.powerSourceCount && parent.powerSourceCount.gasoline) || 0,
      diesel: (parent.powerSourceCount && parent.powerSourceCount.diesel) || 0,
      electric: (parent.powerSourceCount && parent.powerSourceCount.electric) || 0,
      hybrid: (parent.powerSourceCount && parent.powerSourceCount.hybrid) || 0,
      unknown: (parent.powerSourceCount && parent.powerSourceCount.unknown) || 0
    }),
    
    decadeCount: (parent) => ({
      _1990s: (parent.decadeCount && parent.decadeCount._1990s) || (parent.decadeCount && parent.decadeCount['1990s']) || 0,
      _2000s: (parent.decadeCount && parent.decadeCount._2000s) || (parent.decadeCount && parent.decadeCount['2000s']) || 0,
      _2010s: (parent.decadeCount && parent.decadeCount._2010s) || (parent.decadeCount && parent.decadeCount['2010s']) || 0,
      _2020s: (parent.decadeCount && parent.decadeCount._2020s) || (parent.decadeCount && parent.decadeCount['2020s']) || 0
    })
  }
};
