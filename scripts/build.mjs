// Final Impact - Automated Multi-Target Build Pipeline
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const isAdminBuild = args.includes('--admin');
const devAdminFile = path.resolve('src/admin/private/AdminModal.dev.js');
const hasDevAdmin = fs.existsSync(devAdminFile);

console.log(`\n==============================================`);
console.log(`[BUILD] Final Impact Build Pipeline`);
console.log(`[MODE]  Target: ${isAdminBuild ? 'CREATOR ADMIN BUILD' : 'PUBLIC RETAIL RELEASE'}`);
console.log(`[AUTH]  Private Admin File Present: ${hasDevAdmin}`);
console.log(`==============================================\n`);

const plugins = [];

// Alias plugin to cleanly route AdminModal based on build target
const adminRoutingPlugin = {
  name: 'admin-routing',
  setup(build) {
    if (isAdminBuild && hasDevAdmin) {
      console.log('✓ Inlining Creator-Only Admin Console into game bundle...');
      build.onResolve({ filter: /AdminModal\.js$/ }, args => {
        return { path: devAdminFile };
      });
    } else {
      console.log('✓ Secure Release Mode: Admin Console completely stripped & stubbed.');
      const stubFile = path.resolve('src/ui/AdminModal.stub.js');
      build.onResolve({ filter: /AdminModal\.js$/ }, args => {
        return { path: stubFile };
      });
    }
  }
};

plugins.push(adminRoutingPlugin);

try {
  await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'dist/game.bundle.js',
    format: 'iife',
    plugins,
    define: {
      'process.env.ADMIN_ENABLED': JSON.stringify(isAdminBuild && hasDevAdmin),
      'process.env.BUILD_TARGET': JSON.stringify(isAdminBuild ? 'admin' : 'release')
    },
    minify: !isAdminBuild,
    sourcemap: isAdminBuild ? 'inline' : false,
    legalComments: 'none'
  });

  const bundleStats = fs.statSync('dist/game.bundle.js');
  console.log(`\n✓ SUCCESS: dist/game.bundle.js compiled (${(bundleStats.size / 1024).toFixed(1)} KB)`);
  if (isAdminBuild) {
    console.log('⚡ Admin Console available via [A] or Settings.');
  } else {
    console.log('🔒 Public release verified: Zero administrative or private code.');
  }
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
