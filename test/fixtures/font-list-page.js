var populatedFontList = (id) => {
    return `
        <li class="font-item">
            <span class="font-name"><a href="/typeface/apercu">Apercu - ${id}</a> <em>8 styles</em></span>
            <a href="/typeface/apercu" class="sample"><span class="s_apercuregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/proximanova">Proxima Nova - ${id}</a> <em>14 styles</em></span>
            <a href="/typeface/proximanova" class="sample"><span class="s_proximanovaregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/bliss">Bliss - ${id}</a> <em>14 styles</em></span>
            <a href="/typeface/bliss" class="sample"><span class="s_blissregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/fsalbertweb">FS Albert Web - ${id}</a> <em>9 styles</em></span>
            <a href="/typeface/fsalbertweb" class="sample"><span class="s_fsalbertwebregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/maisonneue">Maison Neue - ${id}</a> <em>12 styles</em></span>
            <a href="/typeface/maisonneue" class="sample"><span class="s_maisonneuebook">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/dintextpro">Din Text Pro - ${id}</a> <em>15 styles</em></span>
            <a href="/typeface/dintextpro" class="sample"><span class="s_dintextproregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/futura">Futura - ${id}</a> <em>12 styles</em></span>
            <a href="/typeface/futura" class="sample"><span class="s_futuramedium">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/museosans">Museo Sans - ${id}</a> <em>10 styles</em></span>
            <a href="/typeface/museosans" class="sample"><span class="s_museosans300">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/reader">Reader - ${id}</a> <em>6 styles</em></span>
            <a href="/typeface/reader" class="sample"><span class="s_readerregular">Why pangolins dream of quiche</span></a>
        </li>
        <li class="font-item">
            <span class="font-name"><a href="/typeface/apercumono">Apercu Mono - ${id}</a> <em>1 style</em></span>
            <a href="/typeface/apercumono" class="sample"><span class="s_apercumonoregular">Why pangolins dream of quiche</span></a>
        </li>
    `;
};
var emptyFontList = `<li class="font-item error"><span>No typefaces found</span></li>`;

module.exports = {
  generate(id) {
    var fontList = id < 10 ? populatedFontList(id) : emptyFontList;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=980" />
        <title>All web fonts | Fontdeck</title>
        <!-- Link to fonts CSS is here, for non-JS users. -->
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/2fAL9UCQZAZ0++LM6cNDY58oqYU/fontdeck.com/1669.css" type="text/css" />
        <link rel="stylesheet" href="/stylesheets/core.css" />
        <link rel="stylesheet" media="print" href="/stylesheets/print.css" />
        <!--[if lt IE 9]>
        <link rel="stylesheet" href="/stylesheets/ie.css" />
      <![endif]-->
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/gKLhNSPD91nHYKdIcbpq3PXNPQY/3/fontdeck.com/apercu/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/KUWlFSMyXxBbnEDrY798TB/++y8/3/fontdeck.com/proximanova/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/LhezRs0M1lpY3MUY3Ns4Qd6Kdow/3/fontdeck.com/bliss/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/a4AhVvngz1YVYx7tEoj4Ut548Ag/3/fontdeck.com/fsalbertweb/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/XxX5dvkbirpu1ARibUNF8Y8OIdE/3/fontdeck.com/maisonneue/book.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/X1AY0q5Ug1BKnMM33ERt5c0JMHs/3/fontdeck.com/dintextpro/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/bP6B1hzuY9P45FCzcko04Q4Ka2M/3/fontdeck.com/futura/medium.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/RERtPqXe78ZP8YOwkN/hKx+MiCA/3/fontdeck.com/museosans/300.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/JX+T15bsVoFgXbVdXabZrR+tnqY/3/fontdeck.com/reader/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/cwgKxrA7HGQxP8ldXG+1Vd7Ug8o/3/fontdeck.com/apercumono/regular.css" type="text/css" />
        <link rel="stylesheet" href="http://f.fontdeck.com/s/css/6DiK9tgiFrfglADyPWZvHIuhTqc/3/fontdeck.com/dindisplaypro/regular.css" type="text/css" />
        <style type="text/css">
            .s_apercuregular,
            .specimen h2 {
                font-family: "Apercu Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_proximanovaregular,
            .specimen h2 {
                font-family: "Proxima Nova Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_blissregular,
            .specimen h2 {
                font-family: "Bliss Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_fsalbertwebregular,
            .specimen h2 {
                font-family: "FS Albert Web Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_maisonneuebook,
            .specimen h2 {
                font-family: "Maison Neue Book", courier;
                font-weight: 300;
                font-style: normal;
            }
            .s_dintextproregular,
            .specimen h2 {
                font-family: "Din Text Pro Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_futuramedium,
            .specimen h2 {
                font-family: "Futura Medium", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_museosans300,
            .specimen h2 {
                font-family: "Museo Sans 300", courier;
                font-weight: 300;
                font-style: normal;
            }
            .s_readerregular,
            .specimen h2 {
                font-family: "Reader Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_apercumonoregular,
            .specimen h2 {
                font-family: "Apercu Mono Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
            .s_dindisplayproregular,
            .specimen h2 {
                font-family: "Din Display Pro Regular", courier;
                font-weight: normal;
                font-style: normal;
            }
        </style>
        <link rel="alternate" title="Fontdeck Recent Fonts" type="application/rss+xml" href="/typefaces/rss" />
    </head>
    <body class="browse fontlist">
        <header>
            <div class="header">
                <div class="section logo">
                    <a href="/"><h1><img src="/images/logos/print-logo.png" alt="Fontdeck" /></h1></a>
                </div>
                <nav>
                    <div class="nav user-nav">
                        <ol class="section">
                            <li><a href="/register">Create an account</a></li>
                            <li><a href="/login">Log in</a></li>
                        </ol>
                    </div>
                </nav>
                <div class="section site-nav">
                    <div class="primary">
                        <nav>
                            <div class="nav">
                                <ol>
                                    <li id="nav-fonts"><a href="/typefaces">Fonts</a></li>
                                    <li id="nav-about"><a href="/about">About</a></li>
                                    <li id="nav-pricing"><a href="/about/pricing">Pricing</a></li>
                                    <li id="nav-showcase"><a href="/showcase">Showcase</a></li>
                                </ol>
                            </div>
                        </nav>
                    </div>
                    <div class="secondary">
                        <form method="get" action="/search" class="search">
                            <input id="search" type="search" name="q" placeholder="Search" value="" />
                            <input class="submit" type="submit" value="Search" />
                        </form>
                    </div>
                    <br style="clear:both" />
                </div>
                <!-- /.section -->
            </div>
            <!-- /.header -->
        </header>
        <div class="content">
            <section>
                <div class="section swap">
                    <h1>All Categories</h1>
                    <div class="primary">
                        <ul class="category-browser">
                            <li class="cat-all active"><a href="/typefaces/all">All</a></li>
                            <li class="cat-serif"><a href="/typefaces/serif">Serif <em>188</em></a>
                            </li>
                            <li class="cat-sansserif"><a href="/typefaces/sansserif">Sans Serif <em>441</em></a>
                            </li>
                            <li class="cat-slabserif"><a href="/typefaces/slabserif">Slab Serif <em>95</em></a>
                            </li>
                            <li class="cat-script"><a href="/typefaces/script">Script <em>107</em></a>
                            </li>
                            <li class="cat-display"><a href="/typefaces/display">Display <em>703</em></a>
                            </li>
                            <li class="cat-nonlatin"><a href="/typefaces/nonlatin">Non-Latin <em>100</em></a>
                            </li>
                        </ul>
                    </div>
                    <div>
                    </div>
                    <div class="secondary browse">
                        <div class="filter-container">
                            <div>
                                <form method="get" class="sort-form" name="sort" id="sort" action="">
                                    <label for="order" class="sort-by">Sort by:
                                        <select name="order" id="order" class="uniform-small">
                                            <option value="popular" selected="selected">Popularity</option>
                                            <option value="abc">Name (A to Z)</option>
                                            <option value="zyx">Name (Z to A)</option>
                                            <option value="newest">Most Recent</option>
                                            <option value="oldest">Least Recent</option>
                                        </select>
                                        <input type="submit" id="updateorder" value="Update" />
                                    </label>
                                </form>
                                <form class="require-js">
                                    <label for="sample-text" class="sample-text-label">Sample Text:
                                        <input type="text" class="sample-text" id="sample-text" name="sample-text" value="Why do pangolins dream of quiche" />
                                    </label>
                                    <select name="sample-select" id="sample-select" class="uniform-text">
                                        <option value="0">Why pangolins dream of quiche</option>
                                        <option value="1">AaBbCcDdEe&hellip;</option>
                                        <option value="2">Font Name</option>
                                        <option value="3">Enter your own text…</option>
                                    </select>
                                    <select id="sample-size-select" class="sample-size" name="sample-size">
                                        <option value="1">12</option>
                                        <option value="2">14</option>
                                        <option value="3">16</option>
                                        <option value="4">18</option>
                                        <option value="5">21</option>
                                        <option value="6">24</option>
                                        <option value="7" selected="selected">30</option>
                                        <option value="8">36</option>
                                        <option value="9">48</option>
                                        <option value="10">60</option>
                                        <option value="11">72</option>
                                        <option value="12">96</option>
                                        <option value="13">144</option>
                                    </select>
                                </form>
                            </div>
                        </div>
                        <!-- /.filter-container -->
                        <div class="primary">
                            <div class="facets">
                                <p>
                                    Showing <strong>1&ndash;10</strong> of <strong>1300</strong> font families</p>
                            </div>
                            <ul class="font-list">
                                ${fontList}
                            </ul>
                            <div class="pagination">
                                <ol>
                                    <li class="selected"><a href="/typefaces/all/1">1</a></li>
                                    <li><a href="/typefaces/all/2">2</a></li>
                                    <li><a href="/typefaces/all/3">3</a></li>
                                    <li>&hellip;</li>
                                    <li><a href="/typefaces/all/130">130</a></li>
                                    <li><a rel="next" href="/typefaces/all/2" class="next">Next &raquo;</a></li>
                                </ol>
                                <p class="summary">Showing <strong>1&ndash;10</strong> of <strong>1300</strong> font families</p>
                            </div>
                        </div>
                        <div class="secondary">
                            <h3 class="no-margin">All Categories Tags</h3>
                            <p class="require-js sort-tags"><a class="alpha ascending" href="#">Alphabetical</a><a class="count" href="#">Popularity</a></p>
                            <ul class="tag-list">
                                <li>123</li>
                            </ul>
                        </div>
                    </div>
                </div>
        </div>
        <footer>
            <div class="footer">
                <section>
                    <div class="section">
                        <div class="primary">
                            <nav>
                                <div class="nav">
                                    <ol>
                                        <li><a href="/foundries">Foundries</a></li>
                                        <li><a href="/designers">Designers</a></li>
                                        <li><a href="/support">Support</a></li>
                                        <li><a href="/contact">Contact</a></li>
                                        <li><a href="http://blog.fontdeck.com">Blog</a></li>
                                        <li><a href="http://twitter.com/fontdeck" onclick="Fontdeck.Track.outboundLink(this, 'Outbound Links', 'Twitter');return false;" title="Fontdeck updated on Twitter">@fontdeck</a></li>
                                    </ol>
                                </div>
                            </nav>
                            <p class="sub">&copy; 2009&ndash;2014 Fontdeck LLC &middot; <a href="/terms">Terms of Service</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/cookies.html">Cookies</a></p>
                        </div>
                        <div class="secondary">
                            <p class="sub"><strong>Fontdeck</strong>&reg; is proudly brought to you by <a href="http://clearleft.com">Clearleft</a>&nbsp;&amp;&nbsp;<a href="http://omniti.com/">OmniTI</a></p>
                        </div>
                    </div>
                </section>
            </div>
            <!-- /.footer -->
        </footer>
    </body>
    </html>
    `;
  }
};
