    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consulta candidato</title>
        <link rel="stylesheet" type="text/css" href="index.css">
    </head>
    <body>
        <div class="painel">
            <form method="post" class="seletores" action="index.php" >
                <select class="seletor-candidatura" default="" name="candidatura" id="candidatura">
                    <option value="" >Candidatura</option>
                    <option  value="prefeito">Prefeitura</option>
                    <option value="vereador">Câmara Municipal</option>
                </select>
                <select class="seletor-estado" default="" name="estado" id="estado">
                    <option value="" >Candidatura</option>
                    <option  value="prefeito">Prefeitura</option>
                    <option value="vereador">Câmara Municipal</option>
                </select>
                <input type="submit" value="teste" />
            </form>
        </div>
        <script src="index.js"></script>
    </body>
    </html>


    <?php
        $x = $_POST["candidatura"];
        echo $x;
    ?>