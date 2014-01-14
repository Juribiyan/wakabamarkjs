wakabamarkjs
============

Настраиваемый парсер Wakabamark Для работы в клиенте.

##Регистрация тегов
###Открывающие и закрывающие теги
    var wm = new WM();
    
    // Классический Вакабамарк
    var wm_tags = [
        [['**','**'],                ['<b>','</b>']],
        [['__','__'],                ['<b>','</b>']],
        [['*','*'],                  ['<i>','</i>']],
        [['_','_'],                  ['<i>','</i>']],
    ];
    
    // "Кусабамарк"
    var ku_tags = [
        [['[b]','[/b]'],                ['<b>','</b>']],
        [['[i]','[/i]'],                ['<i>','</i>']],
        [['[u]','[/u]'],                ['<span style="text-decoration: underline">','</span>']],
        [['[s]','[/s]'],                ['<strike>','</strike>']],
        [['%%','%%'],                   ['<span class="spoiler">','</span>']],
        [['[spoiler]','[/spoiler]'],    ['<span class="spoiler">','</span>']],
        [['[aa]','[/aa]'],              ['<span style="font-family: Mona,\'MS PGothic\' !important;">','</span>']]
    ];
    
    wm.registerTags(wm_tags);
    wm.registerTags(ku_tags);

###Теги запрета разметки
Внутри этих тегов разметка будет эскейпиться.

    var bypass_tags = [
        [['[code]','[/code]'],          ['<pre class="code">','</pre>']],
        [['`','`'],                     ['<pre class="code">','</pre>']]
    ];
    
    wm.registerTags(bypass_tags, 'bypass');
    
###Теги списков
Новые строки, начинающиеся с указанного символа будут обернуты в список.

    var lists = [
        ["* ", ["<ul>","</ul>"]],
        ["# ", ["<ol>","</ol>"]]
    ];
    
    wm.registerTags(lists, 'lists');

##Опции

    wm.options = {
        makeLinks: true,            // Детектировать ссылки или нет
        bypass: true,               // Эскейпить разметку внутри кода или нет
        greenquoting: true,         // >Зеленый текст >2014
        makeEmbeds: true,           // Преобразовывать ссылки на картинки с rghost.ru в формате [:999999:] в превью
        makeLists: true,            // Списки вкл/выкл
        reduceNewlines: true        // Сокращать пустые переносы строк вкл/выкл
    }
