//////////////////////////////////////////////////////////////////////
//
// Command: push
//
// Pushes the current or specified folder to a remote server using
// the sync feature.
//
//////////////////////////////////////////////////////////////////////

const path = require('path')

const Site = require('../../index')
const sync = require('../lib/sync')
const generateContent = require('../lib/generate-content')
const clr = require('../../lib/clr')

function push (args) {
  // Make sure the local path ends with the path separator so that the contents of the folder
  // are synced and not the folder itself.
  const _pathToPush = args.positional[0] || '.'
  const pathToPush = _pathToPush.endsWith(path.sep) ? _pathToPush : `${_pathToPush}${path.sep}`

  const absolutePathToPush = path.resolve(pathToPush)

  const pathFragments = absolutePathToPush.split(path.sep)
  const directoryToPush = pathFragments[pathFragments.length -1]

  // Either use the convention that the directory should be named with the domain
  // to push to or, if an override has been provided in the --domain option, use that.
  const host = args.named.domain || directoryToPush
  const account = 'site'
  const remotePath = '/home/site/public'

  const to = `${account}@${host}:${remotePath}`

  const options = {
    from: pathToPush,
    to,
    account,
    host,
    remotePath,
    live: false,
    includeDatabase: false
  }

  if (args.named.db) {
    options.includeDatabase = true
  }

  Site.logAppNameAndVersion()

  ;(async () => {
    // Generate any content that needs to be generated (e.g., Hugo content).
    await generateContent(pathToPush, host, Site)

    console.log(`\n   ⏩    ❨site.js❩ Pushing from ${clr(pathToPush, 'yellow')} to ${clr(host, 'yellow')}…\n`)

    // Any content that needs to be generated has been generated. Ready to sync.
    sync(options)
  })()
}

module.exports = push
