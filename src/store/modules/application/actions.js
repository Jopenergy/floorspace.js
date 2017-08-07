export default {
  setCurrentStoryId(context, payload) {
    const { id } = payload;
    context.commit('setCurrentStoryId', { id });
  },

  setCurrentSubSelectionId(context, payload) {
    const { id } = payload;
    context.commit('setCurrentSubSelectionId', { id });
  },

  setCurrentTool(context, payload) {
    const { tool } = payload;
    // check that the tool exists
    if (context.state.tools.indexOf(tool) !== -1) {
      context.commit('setCurrentTool', { tool });
    }
  },

  setCurrentMode(context, payload) {
    const { mode } = payload;
    // check that the mode exists
    if (context.state.modes.indexOf(mode) !== -1) {
      context.commit('setCurrentMode', { mode });
    }
  },

  setCurrentBuildingUnit(context, payload) {
    const building_unit = payload.building_unit ? context.rootState.models.library.building_units.find(b => b.id === payload.building_unit.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentBuildingUnit', {
      building_unit: building_unit
    });
  },

  setCurrentThermalZone(context, payload) {
    const thermal_zone = payload.thermal_zone ? context.rootState.models.library.thermal_zones.find(b => b.id === payload.thermal_zone.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentThermalZone', {
      thermal_zone: thermal_zone
    });
  },

  setCurrentSpaceType(context, payload) {
    const space_type = payload.space_type ? context.rootState.models.library.space_types.find(b => b.id === payload.space_type.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentSpaceType', {
      space_type: space_type
    });
  },

  // update d3's scaling functions
  setScaleX(context, payload) {
    const { scaleX } = payload;
    context.commit('setScaleX', { scaleX });
  },
  setScaleY(context, payload) {
    const { scaleY } = payload;
    context.commit('setScaleY', { scaleY });
  },
};
