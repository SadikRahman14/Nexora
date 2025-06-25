# Developer Notes

## 📦 Installing Development-Only Dependencies

To install a package only for development (i.e., not required in production), use the `-D` or `--save-dev` flag:

```bash
npm i -D nodemon
```

## 📦 Keeping track of empty folder
Git does not keep a track of empty folders. We need to add a .gutkeep file in that folder to keep track
```bash
touch .controllers/.gitleep
```
