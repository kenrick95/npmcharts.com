import npmData from '../services/downloads.js';
import {graph} from '../graph/graph.js';
// import {removePackage} from '../packages/packages.js';
import config from '../../config.js';

const palette = config.palette;

window.graph = graph;
window.npmData = npmData;

var {default: packageInput, packages, removePackage} = require('../packages/packages.js');

export default Vue.extend({
  route: {
    waitForData: true,
    data ({ to, next, redirect }) {
      const packageNames = to.params.packages ? to.params.packages.split(',') : _.sample(config.presetPackages);
      npmData.fetch(...packageNames)
        .then(() => {
          next({moduleNames: npmData.moduleNames, moduleData: npmData.modules, isPreset: !to.params.packages});
        })
    }
  },
  data () {
    return {
      moduleNames: null,
      moduleData: null,
      palette,
      noWeekends: true,
      isPreset: undefined
    };
  },
  ready () {
    window.hhh = this;
  },
  template: `
    <main>
      <div class="info-panel">
        <package-input bind-on-submit="addPackage"></package-input>
        <button on-click="clearPackages" bind-disabled="isUsingPresetData">clear</button>
        <label><input type="checkbox" v-model="noWeekends"/>no weekends</label>
        gulp vs grunt
      </div>
      <legend slot="legend" v-if="moduleNames && palette" bind-modules="moduleNames" bind-palette="palette" bind-on-module-clicked="removePackage"></legend>
      <graph class="chart" bind-class="{'is-preset': isPreset}" v-if="moduleNames" bind-module-names="moduleNames" bind-module-data="moduleData" bind-no-weekends="noWeekends">
      </graph>
    </main>
    <footer>
      Created by Chang Wang
    </footer>
    `,
    computed: {
      isUsingPresetData () {
        return !(this.$route.params && this.$route.params.packages);
      }
    },
    methods: {
      addPackage (packageName) {
        if (this.$route.params && this.$route.params.packages) {
          this.$route.router.go('/compare/' + this.$route.params.packages + ',' + packageName);
        } else {
          this.$route.router.go('/compare/' + packageName);
        }
      },
      clearPackages () {
        this.$route.router.go('/compare/');
      },
      removePackage (packageName) {
        removePackage(packageName);
        this.$route.router.go('/compare/' + packages.join(','));
      }
    },
    components: {
      'package-input': packageInput,
      graph: require('../graph/graph.js'),
      legend: require('../legend/legend.js')
    }
});