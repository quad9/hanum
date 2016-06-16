■[JavaScript]アラビア数字を漢数字に変換Add Starworks014k_ikikamiseto
アラビア数字を漢数字に変換するルーチンはいろいろあると思うんですが、どうも需要に合わなかったのでちょっと書いてみました。主な特徴は

小数点以下に対応（"割", "分", "厘", "毛"....）
任意の整数桁を単純変換（3桁を指定 => 千五〇〇）
漢数詞の有無を指定
全角数字などの表記のゆれに対応
整数部分の有効範囲は0～1072 - 1（漢数詞は「無量大数」）、小数点以下は10-24（漢数詞は「浄」）までです。

まだ完全ではないと思うので、不都合があればコメントいただけると嬉しいです。

/*
アラビア数字を漢数字に変換
(c)2009 市川せうぞー　GNU GPLv3

主な特徴は
・小数点以下に対応（"割", "分", "厘", "毛"....）
・任意の整数桁を単純変換（3桁を指定 => 千五〇〇）
・漢数詞の有無を指定
・全角数字などの表記のゆれに対応
整数部分の有効範囲は0～10^72 - 1（漢数詞は「無量大数」）、小数点以下は10^-24（漢数詞は「浄」）までです。
くわしいお取り扱いは、下記を参照してください。
http://d.hatena.ne.jp/seuzo/20090611/1244701472

===HISTORY
2009-06-11	とりあえず
*/


////すべてを漢数字に変換
function num2kan (n, delete_comma) {
/*
n	number or strings	アラビア数字列
delete_comma	bool	位取りのコンマを削除するかどうか => falseの時、コンマは「、」に変換されます
--
result	string	漢数字
*/
	var output_data = "";//返り値
	var tmp_hash = {};//置換用のハッシュ
	n = (n + "").replace(/ +/g, '');//半角スペースを削除
	if (/[^0-9０-９,.，、．・]+/.test(n)) {return n}//数字以外が含まれている
	if (delete_comma) {//カンマを削除
		tmp_hash =  {"0":"〇", "1":"一", "2":"二", "3":"三", "4":"四", "5":"五", "6":"六", "7":"七", "8":"八", "9":"九", "０":"〇", "１":"一", "２":"二", "３":"三", "４":"四", "５":"五", "６":"六", "７":"七", "８":"八", "９":"九", ",":"", ".":"・", "，":"", "、":"", "．":"・", "・":"・"};
		for (var i = 0; i< n.length; i++) {output_data += tmp_hash[n[i]]}
	} else {
		tmp_hash =  {"0":"〇", "1":"一", "2":"二", "3":"三", "4":"四", "5":"五", "6":"六", "7":"七", "8":"八", "9":"九", "０":"〇", "１":"一", "２":"二", "３":"三", "４":"四", "５":"五", "６":"六", "７":"七", "８":"八", "９":"九", ",":"、", ".":"・", "，":"、", "、":"、", "．":"・", "・":"・"};
		for (var i = 0; i< n.length; i++) {output_data += tmp_hash[n[i]]}
	}
	return output_data;
}


////漢数詞付き漢数字に変換
function num2kan_numeral(n, ignore_digit, decimal_keta){
/*
n	number or strings	アラビア数字列
ignore_digit	int	漢数詞をつけない桁数
decimal_keta	bool	小数点以下に漢数詞をつけるかどうか
--
result	string	漢数字
*/
	var output_data = "";//返り値
	var keta_middle = ["", "十", "百", "千"];
	var keta_big = ["", "万", "億", "兆", "京", "垓", "&#25771;", "穣", "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祗", "那由他", "不可思議", "無量大数"];
	var keta_small = ["割", "分", "厘", "毛", "糸", "忽", "微", "繊", "沙", "塵", "埃", "渺", "漠", "模糊", "逡巡", "須臾", "瞬息", "弾指", "刹那", "六徳", "虚", "空", "清", "浄"];
	n = num2kan(n, true);//すべてを漢数字に
	if (n === "〇") {return "零"}
	if (/[0-9]+/.test(n)) {return n}//未変換（たぶん数字以外のものが含まれています）
	var m = n.split("・");
	if (m[0]) {//整数部分
		var m_int = m[0].match(/./g).reverse();
	} else {
		var m_int = [];
	}
	var m_float = m[1];
	var tmp_mod = 0;//余り
	var tmp_div = 0;//整数除算
	var output_float = "・";//小数点以下の返り値

	//整数部分
	for (var i = 0; i < m_int.length; i++) {
		if (i < ignore_digit) {//指定桁数以下は無条件に漢数字のまま
			output_data =  m_int[i] + output_data;
			continue;
		}
		if (m_int[i] === "〇") {continue};
		
		tmp_mod = i % 4;//余り
		if (tmp_mod === 0) {//大きな桁
			tmp_div = parseInt ((i + 1) / 4);//整数除算
			output_data = m_int[i] + keta_big[tmp_div] + output_data;
		} else {//"十", "百", "千"の桁
			output_data = m_int[i] + keta_middle[tmp_mod] + output_data;
		}
	}//for
	output_data = output_data.replace(/一(?=[十百])/g, "");
	if (tmp_div  === 0) {output_data = output_data.replace(/一(?=[千])/g, "");};//4桁の時だけ「一千」を「千」にする
	
	//小数部分
	if (m_float) {//小数部分が存在する
		if ((output_data === "〇") || (output_data === "")) {
			output_data = "";
		} else {
			output_data += "・";
		}
		if (decimal_keta) {//漢数詞を挿入する
			for (var i = 0; i< m_float.length; i++) {
				if (m_float[i] === "〇") {continue};
				output_data += m_float[i] + keta_small[i];
			}
		} else {//そのまま結合する
			output_data += m_float;
		}
	}
	return output_data;
}
※1024の漢数詞は「禾予」（unicode 25771）です。文字化ける場合はなんらかの処置が必要です。

使い方

・単純置換（位取りカンマあり）
num2kan ("123, 456,789.0123", false);
//一二三、四五六、七八九・〇一二三

・単純置換（位取りカンマなし）
num2kan ("123, 456,789.0123", true);
//一二三四五六七八九・〇一二三

・整数部分のすべてに漢数詞をつける
num2kan_numeral(123456789, 0, false);
//一億二千三百四十五万六千七百八十九

・整数部分の下3桁には漢数詞をつけない
num2kan_numeral(12345, 3, false);
//一万二千三四五

・小数点以下に漢数詞をつける
num2kan_numeral(123.456789, 0, true)
//百二十三・四割五分六厘七毛八糸九忽

・小数点以下に漢数詞をつけない
num2kan_numeral(123.456789, 0, false)
//百二十三・四五六七八九

・整数部分が0、かつ、漢数詞をつける
num2kan_numeral(0.123456789, 0, true);
//一割二分三厘四毛五糸六忽七微八繊九沙

・1500は「一千五百」ではなく「千五百」
num2kan_numeral(1500, 0, false);
//千五百

・0は「零」を返す
num2kan_numeral(0, 0, false);
//零

・不必要な文字が渡されたら、なにもしない。それが符号等であったとしても
num2kan_numeral("-123", 0, false);
//-123


●表記のゆれ
・全角数字を変換
num2kan_numeral("１２３，４５６．７８９０", 0, false);
//十二万三千四百五十六・七八九〇

・位取りカンマや小数点のピリオドに空白スペースが含まれる
num2kan_numeral("123, 456. 789", 0, false);
//十二万三千四百五十六・七八九

・位取りカンマに使用できる文字種は「,，、」、小数点のピリオドに使用できる文字種は「.．・」
num2kan_numeral("123，456、789・0123", 0, false);
//一億二千三百四十五万六千七百八十九・〇一二三
