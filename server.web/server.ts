import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const port = process.env.port || process.env.PORT || 4430;

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const fileName = path.basename(parsedUrl.pathname);

    if (fileName.indexOf('.js') != -1) {
        fs.readFile(`./dist/${fileName}`, function (error, fileResponse) {
            if (error) {
                response.writeHead(404);
                response.write('Contents you are looking are Not Found');
            } else {
                response.writeHead(200, { 'Content-Type': 'application/javascript' });
                response.write(fileResponse);
            }

            response.end();
        });
    } else {
        let viewName = fileName;

        if (fileName == 'Tab') {
            const value = parsedUrl.query['view'];

            switch (value) {
                case 'dashboard':
                    viewName = 'Dashboard';
                    break;
                case 'course-catalog':
                    viewName = 'CourseCatalog';
                    break;
                case 'course':
                    viewName = 'Course';
                    break;
                case 'training':
                    viewName = 'Training';
                    break;
            }
        }

        if (!viewName && parsedUrl.query['webUrl']) {
            viewName = 'Course';
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(`
<html>
    <head>
        <script src="https://secure.aadcdn.microsoftonline-p.com/lib/1.0.16/js/adal.min.js"></script>
        <script src="https://statics.teams.microsoft.com/sdk/v1.0/js/MicrosoftTeams.js"></script>                
    </head>
    <body>
        <div id="main">
            <span style="font-family: 'Segoe UI', Tahoma, Helvetica, Sans-Serif; font-size: 1.125rem; line-height: 2rem; color:rgba(22,35,58,0.74);">We're getting things ready for you, just a moment...</span>
        </div>

        <script>
            window.process = { env: { NODE_ENV: '${process.env.NODE_ENV}' } };
        </script>
        <script src="/dist/client-vendors.packed.js"></script>
        <script src="/dist/client.packed.js"></script>
        <script>
            this["ef.lms365.client"].render${viewName}View();
        </script>
    </body>
</html>
        `);
        response.end();
    }
});

server.listen(port);