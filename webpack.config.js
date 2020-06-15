let path=require('path');
//配置HTML模板插件
let HtmlWebpackPlugin=require("html-webpack-plugin");
//抽离css样式让index.html里面的css样式变成link引入
let MiniCssExtractPlugin=require('mini-css-extract-plugin');
//console.log(path.resolve('dist'));
//css压缩
let OptimizeCss=require('optimize-css-assets-webpack-plugin');
//js压缩
let UglifyjsPlugin=require('uglifyjs-webpack-plugin');

//post-css 处理 css 兼容
let postCss=require('autoprefixer')({
     "overrideBrowserslist": [
          'last 10 Chrome versions',
          'last 5 Firefox versions',
           'Safari >= 6',
           'ie> 8'
      ]
})
module.exports={
    mode: "development",//模式 默认两种production(生产环境:代码压缩) development(开发环境:代码不压缩)
	//多入口
    entry:{
	  index:"./src/index.js",
	  admin:"./src/admin.js"
	},//入口
    output: {
		////如果是多页面应用不能写死需要用到[name]自动获取入口的index和admin
        filename: "[name].js",//打包后的文件名
        path: path.resolve('dist'),//路径必须是一个绝对路径
		publicPath:"/",//build之后的公共路径
    },
	//一个数组存放所有插件
	plugins:[
		new HtmlWebpackPlugin({
			//关联咱们模板html文件
			template:"./public/index.html",
			filename:"index.html",
			minify:{
				//折叠换行true不换行
				collapseWhitespace:true,
				removeAttributeQuotes:true,//去除html双引号true去除双引号
			},
			hash:true,//生产环境下生成hash戳
			chunks:['index'],//只引用index.js,解决index.html里面有index.js和admin.js的问题
			
		}),
		new HtmlWebpackPlugin({
			//关联咱们模板html文件
			template:"./public/admin.html",
			filename:"admin.html",
			minify:{
				//折叠换行true不换行
				collapseWhitespace:true,
				removeAttributeQuotes:true,//去除html双引号true去除双引号
			},
			hash:true, //生产环境下生成hash戳
			chunks:['admin'],
		}),
		new MiniCssExtractPlugin({
			filename:'static/css/main.css'
		}),
		new OptimizeCss({}),//优化 压缩css
		//压缩js
		new UglifyjsPlugin({
			cache:true, //是否用缓存
			parallel:true, //是否并发打包
			sourceMap:true //es6映射es5需要用
		}), 
	],
	module:{
		rules:[
			{
			    test:/\.css$/,
			    use:[
					MiniCssExtractPlugin.loader,//都放到了上面的main.css里面
					{
						loader:"css-loader"
					},
					{
						loader:'postcss-loader',
						options: {
							plugins:[
								postCss
							]
						}
					}
			
				]
			},
			{
				test:/\.(png|jpg|gif|jpeg)$/,
				use:{
					loader:"url-loader", //file-loader加载图片，url-loader图片小于多少k用base64显示
					options: {
						limit:100*1024, //小于100k用base64
						//build之后的目录分类
						outputPath:'static/images'                    },
				}
			},
			{
				test:/\.js$/,//支持require('*.js')文件
				use:{
					loader:'babel-loader',
					options:{//用babel-loader 需要把es6-es5
						presets:[
							'@babel/preset-env'
						],
						plugins:[
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-transform-runtime'
						]
					}
				},
				include:path.resolve(__dirname,'src'),//需要转换的文件夹
				exclude:/node_modules/ //排除转换的文件夹
			},
		]
	},
    devServer: {//开启服务器配置
        port:8080,//端口，
        host:"localhost",//ip地址:localhost本地，0.0.0.0可以访问网络地址
        progress:true,//开启进度条
        contentBase:"./build",//默认打开目录
       //open:true, //自动打开浏览器,
        compress:true,//启动gzp压缩
        proxy: {
            '/api': {
                target: 'http://10.0.193.147:8080',//要代理的地址
                changeOrigin: true, //是否跨域，如果target是域名则需要配置，如果是ip地址不需要
                pathRewrite: {
                    '^/api': '' //需要rewrite的,
                }
            }
        }
	},
	
}