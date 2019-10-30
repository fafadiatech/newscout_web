import re
import json
from collections import OrderedDict


class RegexClassification(object):
    """
    regex classification class
    """

    def __init__(self):
        self.regex = OrderedDict({
            "125": "(Wells\sFargo|Finance\sBank|(Yes|YES)\sBank|Axis|HDFC|SBI|ICICI|Deutsche|IDBI|DBS|RBS|TSB|Goldman(\sSachs)?|Citi(group|\s[Bb]ank)|Bank\sof\sBaroda|J\&K\sBank|NBFCs?|PSU\s[Bb]ank?|IDFC|Bank\sof\sIndia)",

            "126": "(Amazon|Walmart|(UK|US|China|Fashion)\sretail(s|er)?|Kroger|Arcadia\s[Gg]roup|Topshop|Sports\sDirect|D(\-Mart|Mart|\sMart)|HUL|Prada|Dressbarn|Hamleys|Sears|Debenhams|Tesco|Sainsbury)",

            "127": "(Apple|Google|Facebook|Netflix|Microsoft|Infosys|IBM|Telegram|Snapchat|WhatsApp|Akamai|AWS|Amazon\sWeb\sService(s)?|Spotify|Vivo|Oppo|Samsung|Realme|JBL|SpaceX|TCS|AI|[Cc]yber((\-)?security)?|Pinterest|Sony|DJI|Drone|iPhone|iPad|NASA|AMD|Intel|Nvidia|Capgemini)",

            "128": "(Tesla|Uber|Lyft|Renault|Fiat|Toyota|Volkswagen|IndiGo|Tata\sMotors|Ford|Honda|redBus|Boeing|[Aa]uto\s[Ss]ale(s)?|Suzuki|AAI|E\-(scooter|bike)|[Ee]lectric\s(vehicle|SUV|bicycle)|[Rr]ailway(s)?\s(station)|[Cc]ommercial\svehicle|Jet\sAirways|Etihad|Bajaj\sAuto|TVS|Maruti|Isuzu|Air\stravel|JLR|(Delhi|Mumbai)\sMetro|Jaguar\sLand\sRover)",

            "129": "(Vedanta|(JSW|Suzlon)\sEnergy|ONGC|BPCL|BP|([Pp]ower|[Bb]attery)\s([Ss]upply|[Ee]xchange|[Pp]lant|[Mm]anagement)|[Pp]eak\s[Pp]pwer|solar\s(system|pump|project)?|CIL|([Cc]oal|[Oo]il)\s?(import|firm)?|[Ff]ossil\sfuel|Adani\s([Ss]olar|[Cc]oal)|[Nn]atural\s[Gg]as|British\sGas|Aramco|[Ee]nergy\s(supplier|firm|price)|[Rr]enewable\s(source|capacity)|\d+\s(MW|mw))",

            "130": "(McDonalds|(Beyond\s|lab\-grown|Artificial)?\s?[Mm]eat(s)?|beer|[Ww]ine|Soylent|USDA|Whole\sFoods|Carls\sJr|Starbucks|[Pp]izza|Coca\-?Cola|FDA|Pillsbury)",

            "131": "([Mm]anufactur(er(s)?|ing)|([Ii]ndustrial|[Ff]actory)\s(output|solution)|build\s(factory|plant)|(commercial|car)\sproduction|Giga\s?factory)",

            "162": "([Ff]in(\s|\-)?[Tt]ech|Paytm|ATM|P[Oo][Ss]|[Dd]igital\s[Pp]ayment|RuPay|[Pp]ayments\sstartup)",

            "165": "(MSNBC|[Ss]eason\s\d+|HBO|Netflix|Inox|Fox\s(News|Network))",

            "134": "(China|Huawei|Xi\s?(Jinping)?|Chinese|[Ss]hanghai|[Bb]eijing)",

            "136": "([Jj]apan(ese)?|Nikkei|[Tt]okyo|Shinzo\s?[Aa]be|Hiroshima)",

            "160": "([Ii]ndia|ISRO)",

            "169": "(EU|Europe(an)?|UK|[Ii]taly|[Gg]erma(ny|n)|[Ff]rance|[Ss]pain|Brexit|Briton)",

            "138": "([Gg]lobal\s([Rr]ecession|[Ss]lowdown)|[Rr]ecession)",

            "139": "(EMI|retirement|investment\splan|[Cc]redit\s[Cc]ard|start\sinvesting|life\sinsurance|insurance\sclaim)",

            "158": "(bags|raise(s|ed)?|pump\sin|issue|invest|launches|for|issue|scores|nabs|close|gets|grabs|launches\swith|lands|upsized|closes|raised\sover|announces)\s\$\d+(\.?\d+)?(M|mn|\s[Mm]illion|\s[Bb]illion)|(raise\sup\sto|gets|raise(s)?)\sRs\s\d+(\,\d+)?(\-|\s)crore",

            "159": "IPO|go\spublic|(first|second)\sday\sof\strading|I\.P\.O|share\slisting|[Ff]irst\s[Dd]ay\s(stock|[Tt]rading)",

            "164": "FY\d+|Q\d\s(loss|revenue|(net\s)?profit)|52-week\s(high|low)|net\s(profit|loss)|share(s)?\s(plunge|jump|buyback)|sales\s(dip|fall|up|down|drop|data|growth|)|pc\sgrowth|revenue\s(hits|jumps|to|up)|stock\sslips|(strong|weak)\sprofit\s(growth|decline)|in\sQ\d|PAT\s(grow|decline)",

            "142": "(US|U\.S\.)\s(GDP|business|consumer\sprices|interest\srate|tariff|trade|growth|jobs|deal)|Wall\sStreet|[Cc]apitalism|[Tt]rade\s[Ww]ar", 

            "143": "[Gg]lobal\s(share|[Mm]arket|business|[Ee]conomy|[Rr]ecovery|[Gg]rowth|econom(y|ic)|[Pp]roductivity|gloom)|(Australian|Asia(n)?|World)\s(share|stock(s)?)",

            "144": "[Hh]ousing\s(finance|sector|demand|market|affordable|slumps|arm)|[Pp]roperty\sprice|[Rr]eal\s[Ee]state|DHFL|RERA|[Hh]ome\s[Ll]oan|[Mm]ortgage|[Hh]ouse(s)?(\s[Pp]rices)?|Indiabulls|Shapoorji\sPallonji|WeWork|inclusive\shousing|[Ll]andlord(s)?|[Hh]ousing\s(slump)",

            "147": "([Oo]il|[Gg]old|[Ss]ilver|[Ss]ugar|[Ii]ron\s[Oo]re|[Cc]oal|[Ss]teel|[Cc]opper|[Nn]ickel|[Aa]gri|[Pp]almolein|[Cc]ashew|[Cc]otton|[Tt]urmeric|[Ss]oya|[Rr]ubber)\s(stock|future|surge|gain|production|mine|climb|steadies|near|output|[Cc]ommodities|fall|[Rr]ate|price(s)?|cost|draws|edges|steady|[Aa]sset|[Mm]arket|[Ee]xport|[Ii]mport|rise|holder)?",

            "148": "[Ii]nflation|PMI|[Rr]ate\s[Cc]ut|[Ii]nterest\s[Rr]ate|[Rr]ate\s([Ii]ncrease|[Dd]ecrease|[Rr]ise)",

            "150": "(Dollar|Rupee|Yuan|Pound)(\s)?(almost|ends|opens|closes|pressured|stuck|snaps|rise|soar|suffer|edge)?",

            "153": "(NCLT|Lawmaker|RBI|CID|TRAI|Sebi|SEBI|CII|CCI|ED|SFIO|MCA|(trading|bribery)\scase)",

            "155": "M\&A|Merger",

            "156": "([Ll]abo(u)?r|[Ww]orker|[Ww]eaken)\s[Uu]nion(s\slobby)?|labor\s(right|board|lawyer|group)|[Ww]orker(s)?\s([Uu]nion|[Pp]ay|[Ff]ear|win|push)|strike\s(plan|ballot|over)",

            "163": "[Bb]itcoin|[Cc]rypto(\sexchange|\-?currenc(y|ies))|[Cc]oin(bit|base)|[Bb]inance|[Bb]lockchain",

            "168": "[Cc]arbon|[Cc]limate\s[Cc]hange|CO2|polluti(on|ng)"
            })

    def match(self, title):
        uncategorised = "123"
        for cat, pattern in self.regex.items():
            if re.search(pattern, title):
                return cat
        return uncategorised
