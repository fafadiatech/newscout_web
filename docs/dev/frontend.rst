Frontend Development Guide
==========================

Overview
````````

Intention of writing this documentation is to help you get started with frontend contributions. To get an overview, we would recommend reading :doc:`../design/architecture` document. Please follow `Developer Setup` section to ensure you have right environment to make contributions.

Running React App
``````````````````

1. Go to the frontend directory using `cd frontend` command.
2. Install all react packages using `npm install` command. If you use yarn use `yarn install`
3. Updated NewScout component install using `npm install {path of newscout-react-component repo}/newscout-0.1.0.tgz` command. Please see the component library packing & installation process if any errors.
4. Use the `npm run build` command for build application or update any js files.

Creating a New Page
```````````````````

Following are steps that explain the workflow of creating and integrating ReactApp with Django Application:

1. Go to the `news_site` directory and open `urls.py` in any editor and create new URL.
2. Open `views.py` and code view for newly created URL.
3. Find `templates` directory and create a new template and add respective contents for newly created views.
4. Go to the `NewsApp` directory in `frontend/src/app` directory.
5. Create a new js file and add respective contents.
6. Find and open `webpack.config.js` file and add the newly created js file with respective path in `module.exports = { entry : {` section.
7. And build the application using the `npm run build` command.
8. Use the `import {component-name} from ‘newscout’ ` command to import any newly created component in the `newscout-react-component` library.
9. Use the `import /newscout/assets/{filename.css}` command to import any css in the newscout-react-component library.


Component Library Packing & Installation
``````````````````````````````

Following are steps on how you build & install `newscout-react-component`

1. Fork from `https://github.com/fafadiatech/newscout-react-components` repo or clone forked repo using SSH command `git clone git@github.com:hkacha/newscout-react-components.git` or using HTTPS command `https://github.com/hkacha/newscout-react-components.git`.
2. Go to the `src` directory using `cd src` command and create a new component and save with .js extension.
3. Use the `npm run build` command for build application or update any js files.
4. Compress app in tgz format using `npm pack` command.
5. Go to the `assets` directory and create any css file.
