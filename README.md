# Zombie NFT Generator - Variant 3 (Full)

This package is a complete scaffold for the full NFT app (Electron + React) including:
- UI to pick images & metadata folders
- IPFS upload via nft.storage (script + UI)
- Metadata updater that writes ipfs:// links
- ZIP export ready for marketplace upload
- Wallet connection placeholders (ethers/web3modal) for future minting features
- GitHub Actions workflow to build Windows installer

**Reference image included**: assets/reference.png  (this was copied from the uploaded file path /mnt/data/A_2D_digital_vector_illustration_infographic_on_a_.png)

## Quickstart (developer)
1. Install Node.js (LTS)
2. In project folder run: `npm install`
3. Run dev server: `npm run dev` and in another terminal `npm start`
4. The app will open. Use UI to select folders and perform uploads.

## Notes for non-developers
- If you don't want to install Node, upload this repo to GitHub and use the included Actions workflow to produce the Windows installer automatically (then download the .exe and run locally).
- Keep your NFT_STORAGE_KEY secret. The app can ask for it at runtime or you can set it as environment variable.

