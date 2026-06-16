//EAsource     =>  ...\MT4\MQL4\Experts
//@kingkingisme  <= TG

#property  copyright "Copyright 2023 - Wim Schrynemakers"
#property description "FREE EA, Indicators > ForexCracked.com"
#property version    "1.31"
#property strict

  enum e_SlippageControlMode      {SCT_2 = 2,SCT_1 = 1  };
  enum e_VirtualStopMode      {VSL_ADV = 3,VSL_BASIC = 2,VSL_OFF = 1  };
  enum Select_Entry_Strategy      {Strategy_TWO = 2,Strategy_ONE = 1  };
  enum e_TimeFrame_St_ONE      {ST1_Chart = 0,ST1_Daily = 1440,ST1_H4 = 240,ST1_H1 = 60,ST1_M30 = 30,ST1_M15 = 15,ST1_M5 = 5,ST1_M1 = 1  };
  enum e_TimeFrame_Entry_Timing      {Entry_T_H4 = 240,Entry_T_H1 = 60,Entry_T_M30 = 30,Entry_T_M15 = 15,Entry_T_M5 = 5,Entry_T_M1 = 1,Entry_T_Tick = 0  };
  enum e_UseOfCompound      {Multi_trades = 2,one_trade = 1,no_compound = 0  };
  enum e_MonitorTradesFilter      {MT_PairOfChart = 1,MT_all = 0  };
  enum e_TimeFrame_Exit_Timing      {ET_H1 = 60,ET_M30 = 30,ET_M15 = 15,ET_M5 = 5,ET_M1 = 1,ET_Tick = 0  };
  enum e_Exit_HL_trailingSL_timeframe      {HLT_D1 = 1440,HLT_H4 = 240,HLT_H1 = 60,HLT_M30 = 30,HLT_M15 = 15,HLT_M5 = 5,HLT_M1 = 1,HLT_Chart = 0  };
  enum ST1_e_MagicTrail_Mode      {ST1_MT_M_B = 2,ST1_MT_M_F = 1,ST1_MT_M_O = 0  };
  enum e_Risk      {RPT = 999,//Manual RiskPerTrade
                   Lots_Per_Balance = 9999,//use LotsizeStep
                   Manual_Lotsize = 0//use Startlots
                     };
  enum Performance_options      {RealProfit = 1,NormalizedProfit = 2  };
  enum RankingOptions      {ranking_pertrade = 2,ranking_profit = 1  };
  enum Reduction_choices      {Red_90 = 90,Red_80 = 80,Red_70 = 70,Red_60 = 60,Red_50 = 50,Red_40 = 40,Red_30 = 30,Red_20 = 20,Red_10 = 10  };
  enum e_factortype      {factor_type_3 = 3,factor_type_2 = 2,factor_type_1 = 1  };
  enum e_TimeSource      {TZ_Broker = 2,TZ_PC = 1,TZ_GMT = 0  };


//------------------
extern bool ShowInfoPanel=true  ;   
extern double InfoPanelSizeAdjust=1  ;    //Adjustment for Infopanel size
extern bool UpdateInfoTesting=false ;    //update infopanel during testing
extern string spreadfilter="------------------------------ Settings ------------------------------"  ;   //- - -
extern bool RunStrategyA=true  ;    //run strategy 1
extern bool RunStrategyC=true  ;    //run strategy 2
extern bool RunStrategyD=true  ;    //run strategy 3
extern bool RunStrategyE=true  ;    //run strategy 4
extern bool RunStrategyF=true  ;    //run strategy 5
extern bool RunStrategyG=true  ;    //run strategy 6
extern bool RunStrategyH=true  ;    //run strategy 7
extern double MaxSpread=500  ;    //Maximum allowed spread
extern bool setSL_TP_After_Entry=false ;   
extern bool Virtual_expiration=true  ;    //Use Virtual Expiration
extern int   ST1_MagicNumber=1000  ;    //BaseMagicnumber
extern string ST1_Comment="Gold Trade Pro"  ;   //Comment for trades
extern string LotSizeSettings="----------------------- LotSize Settings -----------------------"  ;   //- - -
extern  e_Risk  Risk=0  ;    //Lotsize Calculation method
extern double StartLots=0.01  ;   
extern int   LotPerBalance_step=600  ;    //LotsizeStep
extern double Manual_RiskPerTrade=2  ;    //Max Risk Per Trade
extern bool UseEquity=false ;    //Use Equity Instead of Balance
extern bool OnlyUp=true  ;   
  double    林_1_do_0 = 0.0;
  bool      林_2_bo_8 = false;
  int       林_3_in_C = 3;
  int       林_4_in_10 = 2;
  bool      林_5_bo_14 = false;
  bool      林_6_bo_15 = false;
  int       林_7_in_18 = 0;
  string    林_8_st_20 = "------------------------------ trading filters ------------------------------";
  bool      林_9_bo_2C = false;
  string    林_10_st_30 = "EURUSD;GBPUSD;USDJPY;AUDJPY;AUDUSD;EURAUD;EURCAD;EURGBP;EURJPY;GBPJPY;USDCAD;USDCHF;";
  bool      林_11_bo_3C = false;
  bool      林_12_bo_3D = true;
  int       林_13_in_40 = 2;
  double    林_14_do_48 = 0.0;
  double    林_15_do_50 = 100.0;
  int       林_16_in_58 = 1;
  double    林_17_do_60 = 4.0;
  double    林_18_do_68 = 1.0;
  double    林_19_do_70 = 3.0;
  bool      林_20_bo_78 = true;
  string    林_21_st_80 = "------------------------------ time filters ------------------------------";
  bool      林_22_bo_8C = false;
  int       林_23_in_90 = 25;
  bool      林_24_bo_94 = false;
  bool      林_25_bo_95 = false;
  int       林_26_in_98 = 14;
  int       林_27_in_9C = 17;
  string    林_28_st_A0 = "------------------------------ other filters ------------------------------";
  bool      林_29_bo_AC = false;
  int       林_30_in_B0 = 1;
  double    林_31_do_B8 = 0.0;
  int       林_32_in_C0 = 99;
  int       林_33_in_C4 = 5;
  bool      林_34_bo_C8 = false;
  int       林_35_in_CC = 5;
  bool      林_36_bo_D0 = true;
  int       林_37_in_D4 = 1;
  string    林_38_st_D8 = "------------------------------ Trade Entry management ------------------------------";
  int       林_39_in_E4 = 0;
  int       林_40_in_E8 = 60;
  int       林_41_in_EC = 10;
  int       林_42_in_F0 = 3;
  bool      林_43_bo_F4 = false;
  bool      林_44_bo_F5 = false;
  int       林_45_in_F8 = 120;
  int       林_46_in_FC = 0;
  int       林_47_in_100 = 0;
  double    林_48_do_108 = 30.0;
  double    林_49_do_110 = 0.0;
  int       林_50_in_118 = 0;
  int       林_51_in_11C = 1077477376;
  double    林_52_do_120 = 0.5;
  double    林_53_do_128 = 0.0;
  double    林_54_do_130 = 0.0;
  int       林_55_in_138 = 1;
  double    林_56_do_140 = 1.0;
  int       林_57_in_148 = 24;
  int       林_58_in_150 = 0;
  int       林_59_in_154 = 1074266112;
  int       林_60_in_158 = 0;
  int       林_61_in_15C = 100;
  int       林_62_in_160 = 0;
  string    林_63_st_168 = "------------------------------ Strategy 2 - Manual Trade settings ------------------------------";
  int       林_64_in_174 = 1;
  int       林_65_in_178 = 0;
  string    林_66_st_180 = "";
  string    林_67_st_190 = "------------------------------ Trade Exit management ------------------------------";
  int       林_68_in_19C = 0;
  double    林_69_do_1A0 = 20.0;
  double    林_70_do_1A8 = 100.0;
  string    林_71_st_1B0 = "------------------------------ Trailing SL settings ------------------------------";
  double    林_72_do_1C0 = 10.0;
  double    林_73_do_1C8 = 10.0;
  double    林_74_do_1D0 = 100.0;
  double    林_75_do_1D8 = 0.1;
  double    林_76_do_1E0 = 0.0;
  string    林_77_st_1E8 = "------------------------------ Break-even SL management ------------------------------";
  double    林_78_do_1F8 = 0.0;
  double    林_79_do_200 = 0.0;
  string    林_80_st_208 = "------------------------------ HIGH/LOW Trailing SL settings ------------------------------";
  bool      林_81_bo_214 = false;
  int       林_82_in_218 = 0;
  int       林_83_in_21C = 0;
  int       林_84_in_220 = 0;
  int       林_85_in_224 = 0;
  int       林_86_in_228 = 0;
  double    林_87_do_230 = 2.0;
  string    林_88_st_238 = "------------------------------ recovery Trailing SL based on time ------------------------------";
  double    林_89_do_248 = 0.0;
  double    林_90_do_250 = 0.0;
  string    林_91_st_258 = "------------------------------ MagicTrail SL settings ------------------------------";
  int       林_92_in_264 = 0;
  double    林_93_do_268 = 0.1;
  int       林_94_in_270 = 1;
  double    林_95_do_278 = 0.1;
  double    林_96_do_280 = 1.0;
  int       林_97_in_288 = 0;
  double    林_98_do_290 = 0.0;
  bool      林_99_bo_298 = false;
  bool      林_100_bo_299 = false;
  double    林_101_do_2A0 = 5.0;
  double    林_102_do_2A8 = 99.0;
  int       林_103_in_2B0 = 99999;
  double    林_104_do_2B8 = 10.0;
  string    林_105_st_2C0 = "==== Performance numbers overview ====";
  bool      林_106_bo_2CC = true;
  int       林_107_in_2D0 = 1;
  int       林_108_in_2D4 = 1;
  int       林_109_in_2D8 = 90;
  int       林_110_in_2DC = 30;
  int       林_111_in_2E0 = 10;
  int       林_112_in_2E4 = 50;
  bool      林_113_bo_2E8 = true;
  string    林_114_st_2F0 = "------------------------------ zone_recovery_settings ------------------------------";
  bool      林_115_bo_2FC = false;
  double    林_116_do_300 = 50.0;
  double    林_117_do_308 = 10.0;
  double    林_118_do_310 = 5.0;
  double    林_119_do_318 = 0.0;
  int       林_120_in_320 = 1;
  double    林_121_do_328 = 2.0;
  int       林_122_in_330 = 999;
  int       林_123_in_338 = 0;
  int       林_124_in_33C = 1079574528;
  int       林_125_in_340 = 900010;
  int       林_126_in_344 = 900011;
  string    林_127_st_348 = "------------------------- Trading hours ST1 -------------------------";
  bool      林_128_bo_354 = false;
  int       林_129_in_358 = 2;
  bool      林_130_bo_35C = false;
  int       林_131_in_360 = 0;
  int       林_132_in_364 = 24;
  int       林_133_in_368 = 0;
  int       林_134_in_36C = 24;
  int       林_135_in_370 = 0;
  int       林_136_in_374 = 24;
  int       林_137_in_378 = 0;
  int       林_138_in_37C = 24;
  int       林_139_in_380 = 0;
  int       林_140_in_384 = 24;
  int       林_141_in_388 = 0;
  int       林_142_in_38C = 24;
  string    林_143_st_390 = "------------------------- use for backtesting only! -------------------------";
  int       林_144_in_39C = 0;
  double    林_145_do_3A0 = 0.0;
  double    林_146_do_3A8 = 0.0;
  int       林_147_in_3B0 = 0;
  double    林_148_do_3B8 = 0.0;
  int       林_149_in_3C0 = 0;
  int       林_150_in_3C4 = 0;
  bool      林_151_bo_3C8 = false;
  bool      林_152_bo_3C9 = false;
  double    林_153_do_400_si20si2[20][2];
  double    林_154_do_574_si100si3[100][3];
  double    林_155_do_F08_si100si2[100][2];
  int       林_156_in_1548 = 20;
  int       林_157_in_154C = 100;
  int       林_158_in_1550 = 0;
  int       林_159_in_1554 = 0;
  int       林_160_in_1558 = 0;
  int       林_161_in_155C = 0;
  int       林_162_in_1560 = 0;
  int       林_163_in_1564 = 0;
  int       林_164_in_1568 = 0;
  int       林_165_in_156C = 0;
  int       林_166_in_1570 = 0;
  int       林_167_in_1574 = 0;
  int       林_168_in_1578 = 0;
  int       林_169_in_157C = 0;
  bool      林_170_bo_1580 = false;
  int       林_171_in_1584 = 10;
  int       林_172_in_1588 = 0;
  int       林_173_in_158C = 0;
  int       林_174_in_1590 = 0;
  int       林_175_in_1594 = 0;
  int       林_176_in_1598 = 0;
  int       林_177_in_159C = 0;
  int       林_178_in_15A0 = 0;
  int       林_179_in_15A4 = 0;
  bool      林_180_bo_15A8 = false;
  int       林_181_in_15AC = 1;
  datetime  林_182_da_15E4_si99[99];
  int       林_183_in_1900 = 0;
  int       林_184_in_1904 = 0;
  int       林_185_in_1908 = 370;
  bool      林_186_bo_190C = true;
  bool      林_187_bo_190D = false;
  int       林_188_in_1910 = 0;
  double    林_189_do_1918 = 4.0;
  int       林_190_in_1920 = 0;
  int       林_191_in_1924 = 0;
  double    林_192_do_195C_si99[99];
  int       林_193_in_1C78 = 0;
  int       林_194_in_1C7C = 0;
  int       林_195_in_1C80 = 0;
  int       林_196_in_1C84 = 0;
  int       林_197_in_1C88 = 0;
  int       林_198_in_1C8C = 0;
  int       林_199_in_1C90 = 0;
  int       林_200_in_1C94 = 0;
  double    林_201_do_1C98 = 0.0;
  int       林_202_in_1CA0 = 0;
  bool      林_203_bo_1CA4 = false;
  int       林_204_in_1CA8 = 0;
  int       林_205_in_1CAC = 0;
  int       林_206_in_1CB0 = 0;
  int       林_207_in_1CB4 = 0;
  int       林_208_in_1CB8 = 0;
  int       林_209_in_1CC0 = 0;
  int       林_210_in_1CC4 = 0;
  int       林_211_in_1CC8 = 0;
  int       林_212_in_1CCC = 0;
  int       林_213_in_1CD0 = 0;
  int       林_214_in_1CD4 = 0;
  bool      林_215_bo_1CD8 = false;
  bool      林_216_bo_1CD9 = false;
  bool      林_217_bo_1CDA = false;
  double    林_218_do_1CE0 = 0.0;
  double    林_219_do_1CE8 = 0.0;
  int       林_220_in_1CF0 = 0;
  int       林_221_in_1CF4 = 0;
  int       林_222_in_1CF8 = 0;
  int       林_223_in_1CFC = 0;
  int       林_224_in_1D00 = 0;
  int       林_225_in_1D04 = 0;
  int       林_226_in_1D08 = 0;
  int       林_227_in_1D0C = 0;
  double    林_228_do_1D10 = 0.0;
  int       林_229_in_1D18 = 0;
  int       林_230_in_1D1C = 0;
  int       林_231_in_1D20 = 0;
  int       林_232_in_1D24 = 0;
  int       林_233_in_1D28 = 0;
  double    林_234_do_1D30 = 0.0;
  string    林_235_st_1D38;
  string    林_236_st_1D48;
  string    林_237_st_1D58;
  string    林_238_st_1D68;
  bool      林_239_bo_1D74 = false;
  bool      林_240_bo_1D75 = false;
  int       林_241_in_1D78 = 0;
  int       林_242_in_1D7C = 0;
  double    林_243_do_1D80 = 0.0;
  double    林_244_do_1D88 = 0.0;
  double    林_245_do_1D90 = 0.0;
  double    林_246_do_1D98 = 0.0;
  double    林_247_do_1DA0 = 0.0;
  int       林_248_in_1DA8 = 0;
  int       林_249_in_1DAC = 0;
  int       林_250_in_1DB0 = 0;
  double    林_251_do_1DB8 = 0.0;
  double    林_252_do_1DC0 = 0.0;
  double    林_253_do_1DC8 = 0.0;
  double    林_254_do_1DD0 = 0.0;
  double    林_255_do_1DD8 = 0.0;
  double    林_256_do_1DE0 = 0.0;
  int       林_257_in_1DE8 = 0;
  int       林_258_in_1DF0 = 0;
  int       林_259_in_1DF4 = 0;
  int       林_260_in_1DF8 = 0;
  int       林_261_in_1DFC = 0;
  int       林_262_in_1E00 = 0;
  int       林_263_in_1E04 = 0;
  bool      林_264_bo_1E08 = false;
  bool      林_265_bo_1E09 = false;
  bool      林_266_bo_1E0A = false;
  bool      林_267_bo_1E0B = false;
  bool      林_268_bo_1E0C = false;
  bool      林_269_bo_1E0D = false;
  int       林_270_in_1E10 = 0;
  int       林_271_in_1E14 = 0;
  int       林_272_in_1E18 = 0;
  int       林_273_in_1E1C = 0;
  bool      林_274_bo_1E20 = false;
  int       林_275_in_1E28 = 0;
  int       林_276_in_1E2C = 0;
  int       林_277_in_1E30 = 0;
  int       林_278_in_1E34 = 0;
  int       林_279_in_1E38 = 0;
  int       林_280_in_1E3C = 0;
  double    林_281_do_1E74_si10[10];
  double    林_282_do_1EF8_si10[10];
  double    林_283_do_1F7C_si10[10];
  double    林_284_do_2000_si10[10];
  int       林_285_in_2050 = 0;
  int       林_286_in_2054 = 0;
  int       林_287_in_2058 = 0;
  int       林_288_in_205C = 0;
  string    林_289_st_2060;
  int       林_290_in_2070 = 0;
  int       林_291_in_2074 = 0;
  int       林_292_in_2078 = 0;
  int       林_293_in_207C = 0;
  datetime  林_294_da_2080 = 0;
  bool      林_295_bo_2088 = false;
  int       林_296_in_208C = 0;
  bool      林_297_bo_2090 = false;
  int       林_298_in_2094 = 0;
  double    林_299_do_2098 = 0.0;
  int       林_300_in_20A0 = 0;
  int       林_301_in_20A4 = 0;
  double    林_302_do_20A8 = 0.0;
  double    林_303_do_20B0 = 0.0;
  double    林_304_do_20B8 = 0.0;
  bool      林_305_bo_20C0 = false;
  datetime  林_306_da_20C8 = 0;
  datetime  林_307_da_20D0 = 0;
  datetime  林_308_da_20D8 = 0;
  bool      林_309_bo_20E0 = false;
  bool      林_310_bo_20E1 = false;
  double    林_311_do_20E8 = 0.0;
  datetime  林_312_da_20F0 = 0;
  bool      林_313_bo_20F8 = false;
  int       林_314_in_2130_si99[99];
  int       林_315_in_22F0_si99[99];
  double    林_316_do_24B0_si30[30];
  double    林_317_do_25D4_si30[30];
  double    林_318_do_26F8_si30[30];
  double    林_319_do_281C_si30[30];
  int       林_320_in_290C = 1;
  int       林_321_in_2910 = 0;
  int       林_322_in_2914 = 9109504;
  bool      林_323_bo_2918 = false;
  int       林_324_in_2920 = 0;
  int       林_325_in_2924 = 0;
  int       林_326_in_2928 = 5;
  bool      林_327_bo_292C = false;
  string    林_328_st_2930;
  bool      林_329_bo_293C = false;
  string    林_330_st_2940;
  double    林_331_do_2950 = 0.0;
  double    林_332_do_2958 = 0.0;
  int       林_333_in_2994_si99[99];
  int       林_334_in_2B20 = 0;
  double    林_335_do_2B58_si99[99];
  bool      林_336_bo_2EA4_si99[99];
  int       林_337_in_2F3C_si99[99];
  int       林_338_in_30FC_si99[99];
  double    林_339_do_32BC_si99[99];
  double    林_340_do_3608_si99[99];
  string    林_341_st_3954_si99[99]={};
  bool      林_342_bo_3E2C_si99[99];
  double    林_343_do_3EC4_si99[99];
  double    林_344_do_4210_si99[99];
  double    林_345_do_455C_si99[99];
  double    林_346_do_48A8_si99[99];
  double    林_347_do_4BF4_si99[99];
  double    林_348_do_4F40_si99[99];
  bool      林_349_bo_528C_si99[99];
  int       林_350_in_5324_si99[99];
  bool      林_351_bo_54B0 = false;
  int       林_352_in_54B8 = 0;
  int       林_353_in_54BC = 1075052544;
  int       林_354_in_54C0 = 0;
  int       林_355_in_54C4 = 1076101120;
  int       林_356_in_54C8 = 0;
  double    林_357_do_54D0 = 0.0;
  double    林_358_do_54D8 = 0.0;
  int       林_359_in_54E0 = 0;
  int       林_360_in_54E4 = 14599344;
  bool      林_361_bo_54E8 = true;
  int       林_362_in_54F0 = 0;
  int       林_363_in_54F4 = 1076363264;
  int       林_364_in_54F8 = 230;
  int       林_365_in_54FC = 320;
  int       林_366_in_5500 = 500;
  int       林_367_in_5504 = 350;
  int       林_368_in_5508 = 2;
  int       林_369_in_550C = 7;
  int       林_370_in_5510 = 10;
  int       林_371_in_5514 = 30;
  string    林_372_st_554C_si4[4]={};
  double    林_373_do_5580 = 0.45;
  double    林_374_do_5588 = 0.6;
  int       林_375_in_5590 = 0;
  datetime  林_376_da_5598 = 0;
  bool      林_377_bo_55A0 = false;
  int       林_378_in_55A4 = 0;


 int init()
 {
  int       文_2_in;
  int       文_3_in;
  int       文_4_in;
  int       文_5_in;
  int       文_6_in;
  int       文_7_in;
//----- -----
 string     轩_st_1;
 bool       轩_bo_2;
 bool       轩_bo_3;

 林_376_da_5598 = 0 ;
 林_377_bo_55A0 = true ;
 林_352_in_54B8 = 0 ;
 林_353_in_54BC = 1075052544 ;
 林_354_in_54C0 = 0 ;
 林_355_in_54C4 = 1076101120 ;
 林_62_in_160 = ST1_MagicNumber ;
 林_356_in_54C8 = 300 ;
 林_357_do_54D0 = 林_369_in_550C * 25 * 林_373_do_5580 * InfoPanelSizeAdjust ;
 林_358_do_54D8 = 林_369_in_550C * 3.5 * 林_374_do_5588 * InfoPanelSizeAdjust ;
 林_359_in_54E0 = 7 ;
 林_321_in_2910 = 0 ;
 林_330_st_2940 = Symbol() ;
 林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
 林_201_do_1C98 = 林_331_do_2950 ;
 if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
 {
   林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
 }
 林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
 if ( 林_23_in_90 <  0 )
 {
   林_22_bo_8C = false ;
 }
 林_234_do_1D30 = TimeCurrent() ;
 林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
 林_192_do_195C_si99[林_321_in_2910] = NormalizeDouble(MathFloor(StartLots * 100.0) / 100.0,2);
 if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
 {
   林_192_do_195C_si99[林_321_in_2910] = NormalizeDouble((MathFloor(StartLots * 10.0)) / 10.0,1);
   if ( 林_192_do_195C_si99[林_321_in_2910]<0.1 )
   {
     林_192_do_195C_si99[林_321_in_2910] = 0.1;
   }
 }
 if ( 林_192_do_195C_si99[林_321_in_2910]<MarketInfo(林_330_st_2940,MODE_MINLOT) )
 {
   Print("Minimum lotsize for this broker is " + string(MarketInfo(林_330_st_2940,MODE_MINLOT)) + "lots!!"); 
   林_192_do_195C_si99[林_321_in_2910] = MarketInfo(林_330_st_2940,MODE_MINLOT);
 }
 if ( 林_192_do_195C_si99[林_321_in_2910]>MarketInfo(林_330_st_2940,MODE_MAXLOT) )
 {
   Print("Maximum lotsize for this broker is " + string(MarketInfo(林_330_st_2940,MODE_MAXLOT)) + "lots!!"); 
   林_192_do_195C_si99[林_321_in_2910] = MarketInfo(林_330_st_2940,MODE_MAXLOT);
 }
 林_298_in_2094 = Bars ;
 if ( 林_95_do_278 * 林_201_do_1C98<林_331_do_2950 )
 {
   林_95_do_278 = 林_331_do_2950 / 林_201_do_1C98 ;
 }
 林_299_do_2098 = AccountBalance() ;
 林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
 林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
 林_289_st_2060 = StringSubstr(Symbol(),6,10) ;
 if ( 林_289_st_2060 != "" )
 {
   Print("Suffix detected: " + 林_289_st_2060); 
 }
 if ( ( StringFind(Symbol(),"XAUUSD",0) >= 0 || StringFind(Symbol(),"xauusd",0) >= 0 || StringFind(Symbol(),"GOLD",0) >= 0 || StringFind(Symbol(),"gold",0) >= 0 || StringFind(Symbol(),"Gold",0) >= 0 ) )
 {
   林_330_st_2940 = Symbol() ;
   林_341_st_3954_si99[林_375_in_5590] = Symbol();
   林_39_in_E4 = 1440 ;
   林_40_in_E8 = 60 ;
   林_41_in_EC = 4 ;
   林_42_in_F0 = 2 ;
   林_45_in_F8 = 160 ;
   林_48_do_108 = 150.0 ;
   林_49_do_110 = 0.0 ;
   林_52_do_120 = -140.0 ;
   林_53_do_128 = -290.0 ;
   林_55_in_138 = 1 ;
   林_56_do_140 = 680.0 ;
   林_57_in_148 = 408 ;
   林_68_in_19C = 1 ;
   林_69_do_1A0 = 1300.0 ;
   林_70_do_1A8 = 1700.0 ;
   林_72_do_1C0 = 800.0 ;
   林_73_do_1C8 = 500.0 ;
   林_74_do_1D0 = 200.0 ;
   林_75_do_1D8 = 0.1 ;
   林_76_do_1E0 = 0.0 ;
   林_328_st_2930=ST1_Comment + "_XAUUSD_A";
   林_62_in_160=ST1_MagicNumber + 1;
   林_321_in_2910 = 0 ;
   林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
   林_201_do_1C98 = 林_331_do_2950 ;
   if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
   {
     林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
   }
   林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
   林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
   林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
   林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
   林_208_in_1CB8=林_57_in_148 * 60 * 60;
   if ( 林_57_in_148 >  0 )
   {
     林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
   }
   else
   {
     林_294_da_2080 = 0 ;
   }
   if ( Virtual_expiration )
   {
     林_294_da_2080 = 0 ;
   }
   ccbsw_20(true); 
   林_375_in_5590 ++;
 }
 else
 {
   林_330_st_2940 = Symbol() ;
   林_321_in_2910 = 0 ;
   林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
   林_201_do_1C98 = 林_331_do_2950 ;
   if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
   {
     林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
   }
   林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
   林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
   林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
   林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
   林_208_in_1CB8=林_57_in_148 * 60 * 60;
   if ( 林_57_in_148 >  0 )
   {
     林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
   }
   else
   {
     林_294_da_2080 = 0 ;
   }
   if ( Virtual_expiration )
   {
     林_294_da_2080 = 0 ;
   }
   ccbsw_20(true); 
 }
 if ( !(林_377_bo_55A0) )
 {
   Print("Initialisation of pairs failed!"); 
 }
 if ( 林_69_do_1A0<=0.0 )
 {
   林_69_do_1A0 = 1.0 ;
 }
 if ( 林_70_do_1A8<=0.0 )
 {
   林_70_do_1A8 = 1.0 ;
 }
 if ( 林_79_do_200>林_78_do_1F8 )
 {
   林_79_do_200 = 林_78_do_1F8 + 0.1 ;
 }
 if ( 林_13_in_40<林_302_do_20A8 / 林_201_do_1C98 )
 {
   林_13_in_40 = 林_302_do_20A8 / 林_201_do_1C98 ;
 }
 if ( 林_72_do_1C0!=0.0 && 林_72_do_1C0<林_302_do_20A8 / 林_201_do_1C98 )
 {
   林_72_do_1C0 = 林_302_do_20A8 / 林_201_do_1C98 ;
 }
 if ( 林_72_do_1C0!=0.0 && 林_72_do_1C0<林_189_do_1918 / 林_201_do_1C98 )
 {
   林_72_do_1C0 = 林_189_do_1918 / 林_201_do_1C98 ;
 }
 if ( 林_89_do_248>0.0 && 林_90_do_250<林_302_do_20A8 / 林_201_do_1C98 )
 {
   林_90_do_250 = 林_302_do_20A8 / 林_201_do_1C98 ;
 }
 if ( 林_89_do_248>0.0 && 林_90_do_250<林_189_do_1918 / 林_201_do_1C98 )
 {
   林_90_do_250 = 林_189_do_1918 / 林_201_do_1C98 ;
 }
 if ( 林_69_do_1A0<林_189_do_1918 * 2.0 / 林_201_do_1C98 )
 {
   林_69_do_1A0 = 林_189_do_1918 * 2.0 / 林_201_do_1C98 ;
 }
 if ( 林_70_do_1A8<林_189_do_1918 * 2.0 / 林_201_do_1C98 )
 {
   林_70_do_1A8 = 林_189_do_1918 * 2.0 / 林_201_do_1C98 ;
 }
 if ( 林_48_do_108<林_189_do_1918 * 2.0 / 林_201_do_1C98 )
 {
   林_48_do_108 = 林_189_do_1918 * 2.0 / 林_201_do_1C98 ;
 }
 if ( 林_41_in_EC <  1 )
 {
   林_41_in_EC = 1 ;
 }
 if ( 林_42_in_F0 <  1 )
 {
   林_42_in_F0 = 1 ;
 }
 if ( 林_48_do_108<0.1 )
 {
   林_48_do_108 = 0.1 ;
 }
 林_208_in_1CB8=林_57_in_148 * 60 * 60;
 if ( 林_57_in_148 >  0 )
 {
   林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
 }
 else
 {
   林_294_da_2080 = 0 ;
 }
 if ( Virtual_expiration )
 {
   林_294_da_2080 = 0 ;
 }
 林_313_bo_20F8 = false ;
 林_243_do_1D80 = Seconds() ;
 林_312_da_20F0 = TimeCurrent() ;
 林_151_bo_3C8 = false ;
 林_152_bo_3C9 = false ;
 林_241_in_1D78 = Month() ;
 林_306_da_20C8 = iTime(林_330_st_2940,PERIOD_W1,1) ;
 林_307_da_20D0 = iTime(林_330_st_2940,PERIOD_M1,1) ;
 林_308_da_20D8 = iTime(林_330_st_2940,PERIOD_M1,1) ;
 if ( 林_14_do_48>MaxSpread )
 {
   林_14_do_48 = MaxSpread ;
 }
 林_240_bo_1D75 = false ;
 ccbsw_10(林_39_in_E4); 
 ccbsw_11(林_39_in_E4); 
 林_145_do_3A0 = NormalizeDouble(林_245_do_1D90,林_147_in_3B0) ;
 林_146_do_3A8 = NormalizeDouble(林_244_do_1D88,林_147_in_3B0) ;
 林_233_in_1D28 = 0 ;
 林_239_bo_1D74 = false ;
 林_296_in_208C = 林_89_do_248 * 60.0 ;
 林_100_bo_299 = false ;
 林_295_bo_2088 = true ;
 林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
 if ( !(林_128_bo_354) )
 {
   林_295_bo_2088 = false ;
 }
 林_148_do_3B8 = 0.0 ;
 林_158_in_1550 = 0 ;
 林_159_in_1554 = 0 ;
 林_160_in_1558 = 0 ;
 林_161_in_155C = 0 ;
 林_217_bo_1CDA = false ;
 林_289_st_2060 = StringSubstr(林_330_st_2940,6,0) ;
 if ( Risk >  0 )
 {
   林_100_bo_299 = true ;
 }
 if ( StartLots<0.0 )
 {
   StartLots = 0.01 ;
 }
 if ( 林_102_do_2A8>MarketInfo(林_330_st_2940,MODE_MAXLOT) )
 {
   林_102_do_2A8 = MarketInfo(林_330_st_2940,MODE_MAXLOT) ;
 }
 for (文_2_in = 0 ; 文_2_in < 林_156_in_1548 ; 文_2_in ++)
 {
   for (文_3_in = 0 ; 文_3_in < 2 ; 文_3_in ++)
   {
     林_153_do_400_si20si2[文_2_in][文_3_in] = 0.0;
   }
 }
 for (文_4_in = 0 ; 文_4_in < 林_157_in_154C ; 文_4_in ++)
 {
   for (文_5_in = 0 ; 文_5_in < 3 ; 文_5_in ++)
   {
     林_154_do_574_si100si3[文_4_in][文_5_in] = 0.0;
   }
 }
 for (文_6_in = 0 ; 文_6_in < 100 ; 文_6_in ++)
 {
   林_154_do_574_si100si3[文_6_in][0] = 0.0;
   林_154_do_574_si100si3[文_6_in][1] = 0.0;
 }
 林_297_bo_2090 = false ;
 林_255_do_1DD8 = iFractals(林_330_st_2940,0,1,1) ;
 林_256_do_1DE0 = iFractals(林_330_st_2940,0,2,1) ;
 林_253_do_1DC8 = 林_255_do_1DD8 ;
 林_254_do_1DD0 = 林_256_do_1DE0 ;
 林_258_in_1DF0 = 0 ;
 林_259_in_1DF4 = 0 ;
 林_203_bo_1CA4 = false ;
 林_280_in_1E3C = Hour() ;
 林_279_in_1E38 = 0 ;
 林_235_st_1D38=ST1_Comment + "B1";
 林_236_st_1D48=ST1_Comment + "B2";
 林_237_st_1D58=ST1_Comment + "S1";
 林_238_st_1D68=ST1_Comment + "S2";
 林_287_in_2058 = 0 ;
 林_288_in_205C = 0 ;
 林_250_in_1DB0 = Hour() ;
 if ( 林_34_bo_C8 )
 {
   林_55_in_138 = 1 ;
   林_264_bo_1E08 = true ;
   林_265_bo_1E09 = true ;
 }
 林_172_in_1588 = 0 ;
 林_173_in_158C = 1083127808 ;
 林_174_in_1590 = 0 ;
 林_175_in_1594 = 0 ;
 林_290_in_2070 = 0 ;
 林_291_in_2074 = 0 ;
 林_292_in_2078 = 0 ;
 林_293_in_207C = 0 ;
 for (文_7_in = 0 ; 文_7_in < 99 ; 文_7_in ++)
 {
   林_315_in_22F0_si99[文_7_in] = 0;
   林_314_in_2130_si99[文_7_in] = 0;
   林_182_da_15E4_si99[文_7_in] = iTime(林_330_st_2940,林_39_in_E4,1);
   if ( !(林_192_do_195C_si99[文_7_in]<StartLots) )   continue;
   林_192_do_195C_si99[文_7_in] = StartLots;
   
 }
 林_183_in_1900 = 0 ;
 林_184_in_1904 = 0 ;
 林_215_bo_1CD8 = false ;
 林_216_bo_1CD9 = false ;
 if ( 林_30_in_B0 == 1 )
 {
   林_31_do_B8 = 0.0 ;
 }
 林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
 林_305_bo_20C0 = false ;
 IsDemo(); 
 轩_st_1 = AccountName();
 StringToLower(轩_st_1); 
 if ( StringFind(轩_st_1,"schrynemakers",0) >= 0 && StringFind(轩_st_1,"wim",0) >= 0 )
 {
   轩_bo_2 = true;
 }
 else
 {   
   if ( AccountNumber() == 928189 )
   {
     轩_bo_2 = true;
   }
   else
   {
     轩_bo_2 = false;
   }
 }
 if ( 轩_bo_2 )
 {
   轩_bo_3 = true;
 }
 else
 {
   轩_bo_3 = false;
 }
 if ( 轩_bo_3 == true )
 {
   林_305_bo_20C0 = true ;
 }
 if ( ShowInfoPanel )
 {
   if ( 林_108_in_2D4 == 1 )
   {
     ccbsw_28(); 
   }
   else
   {
     if ( 林_108_in_2D4 == 2 )
     {
       ccbsw_29(); 
     }
   }
   ccbsw_21(); 
   ccbsw_24(); 
   ccbsw_26(); 
 }
 return(0); 
 }
//init <<==--------   --------
 void OnTick()
 {
 if ( !(林_377_bo_55A0) )   return;
 
 if ( ( StringFind(Symbol(),"XAUUSD",0) >= 0 || StringFind(Symbol(),"xauusd",0) >= 0 || StringFind(Symbol(),"GOLD",0) >= 0 || StringFind(Symbol(),"gold",0) >= 0 || StringFind(Symbol(),"Gold",0) >= 0 ) )
 {
   林_330_st_2940 = Symbol() ;
   if ( RunStrategyA )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 4 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 160 ;
     林_48_do_108 = 150.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -140.0 ;
     林_53_do_128 = -290.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 680.0 ;
     林_57_in_148 = 408 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 1300.0 ;
     林_70_do_1A8 = 1700.0 ;
     林_72_do_1C0 = 800.0 ;
     林_73_do_1C8 = 500.0 ;
     林_74_do_1D0 = 200.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_A";
     林_62_in_160=ST1_MagicNumber + 1;
     林_321_in_2910 = 0 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(0); 
   }
   if ( 林_11_bo_3C )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 3 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 180 ;
     林_48_do_108 = 400.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = 10.0 ;
     林_53_do_128 = -220.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 380.0 ;
     林_57_in_148 = 168 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 2500.0 ;
     林_70_do_1A8 = 1900.0 ;
     林_72_do_1C0 = 100.0 ;
     林_73_do_1C8 = 0.0 ;
     林_74_do_1D0 = 200.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_B";
     林_62_in_160=ST1_MagicNumber + 2;
     林_321_in_2910 = 1 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(1); 
   }
   if ( RunStrategyC )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 18 ;
     林_42_in_F0 = 3 ;
     林_45_in_F8 = 180 ;
     林_48_do_108 = 900.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -130.0 ;
     林_53_do_128 = -30.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 980.0 ;
     林_57_in_148 = 408 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 1200.0 ;
     林_70_do_1A8 = 1800.0 ;
     林_72_do_1C0 = 750.0 ;
     林_73_do_1C8 = 600.0 ;
     林_74_do_1D0 = 200.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_C";
     林_62_in_160=ST1_MagicNumber + 3;
     林_321_in_2910 = 2 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(2); 
   }
   if ( RunStrategyD )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 4 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 240 ;
     林_48_do_108 = 900.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -250.0 ;
     林_53_do_128 = -130.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 680.0 ;
     林_57_in_148 = 48 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 1300.0 ;
     林_70_do_1A8 = 1700.0 ;
     林_72_do_1C0 = 800.0 ;
     林_73_do_1C8 = 500.0 ;
     林_74_do_1D0 = 200.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_D";
     林_62_in_160=ST1_MagicNumber + 4;
     林_321_in_2910 = 3 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(3); 
   }
   if ( RunStrategyE )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 15 ;
     林_42_in_F0 = 3 ;
     林_45_in_F8 = 230 ;
     林_48_do_108 = 550.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -170.0 ;
     林_53_do_128 = -70.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 480.0 ;
     林_57_in_148 = 480 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 600.0 ;
     林_70_do_1A8 = 1700.0 ;
     林_72_do_1C0 = 500.0 ;
     林_73_do_1C8 = 300.0 ;
     林_74_do_1D0 = 200.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_E";
     林_62_in_160=ST1_MagicNumber + 5;
     林_321_in_2910 = 4 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(4); 
   }
   if ( RunStrategyF )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 12 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 50 ;
     林_48_do_108 = 700.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -210.0 ;
     林_53_do_128 = -60.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 30.0 ;
     林_57_in_148 = 384 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 1000.0 ;
     林_70_do_1A8 = 1900.0 ;
     林_72_do_1C0 = 600.0 ;
     林_73_do_1C8 = 500.0 ;
     林_74_do_1D0 = 1000.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_F";
     林_62_in_160=ST1_MagicNumber + 6;
     林_321_in_2910 = 5 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(5); 
   }
   if ( RunStrategyG )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 17 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 110 ;
     林_48_do_108 = 150.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -40.0 ;
     林_53_do_128 = -140.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 280.0 ;
     林_57_in_148 = 240 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 1200.0 ;
     林_70_do_1A8 = 1600.0 ;
     林_72_do_1C0 = 600.0 ;
     林_73_do_1C8 = 200.0 ;
     林_74_do_1D0 = 4400.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_G";
     林_62_in_160=ST1_MagicNumber + 7;
     林_321_in_2910 = 6 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(6); 
   }
   if ( RunStrategyH )
   {
     林_39_in_E4 = 1440 ;
     林_40_in_E8 = 60 ;
     林_41_in_EC = 7 ;
     林_42_in_F0 = 2 ;
     林_45_in_F8 = 20 ;
     林_48_do_108 = 250.0 ;
     林_49_do_110 = 0.0 ;
     林_52_do_120 = -130.0 ;
     林_53_do_128 = -120.0 ;
     林_55_in_138 = 1 ;
     林_56_do_140 = 980.0 ;
     林_57_in_148 = 432 ;
     林_68_in_19C = 1 ;
     林_69_do_1A0 = 600.0 ;
     林_70_do_1A8 = 4900.0 ;
     林_72_do_1C0 = 600.0 ;
     林_73_do_1C8 = 350.0 ;
     林_74_do_1D0 = 2000.0 ;
     林_75_do_1D8 = 0.1 ;
     林_76_do_1E0 = 0.0 ;
     林_328_st_2930=ST1_Comment + "_XAUUSD_H";
     林_62_in_160=ST1_MagicNumber + 8;
     林_321_in_2910 = 7 ;
     林_331_do_2950 = SymbolInfoDouble(林_330_st_2940,16) ;
     林_201_do_1C98 = 林_331_do_2950 ;
     if ( ( MarketInfo(林_330_st_2940,MODE_DIGITS)==3.0 || MarketInfo(林_330_st_2940,MODE_DIGITS)==5.0 ) )
     {
       林_201_do_1C98 = 林_331_do_2950 * 10.0 ;
     }
     林_147_in_3B0 = MarketInfo(林_330_st_2940,MODE_DIGITS) ;
     林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
     林_189_do_1918 = MarketInfo(林_330_st_2940,MODE_STOPLEVEL) * 林_331_do_2950 ;
     林_302_do_20A8 = MarketInfo(林_330_st_2940,MODE_FREEZELEVEL) * 林_331_do_2950 ;
     林_208_in_1CB8=林_57_in_148 * 60 * 60;
     if ( 林_57_in_148 >  0 )
     {
       林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
     }
     else
     {
       林_294_da_2080 = 0 ;
     }
     if ( Virtual_expiration )
     {
       林_294_da_2080 = 0 ;
     }
     ccbsw_6(7); 
   }
 }
 else
 {
   林_330_st_2940 = Symbol() ;
   ccbsw_6(0); 
 }
 ccbsw_24(); 
 if ( iTime(Symbol(),PERIOD_M5,1) != 林_376_da_5598 )
 {
   林_376_da_5598 = iTime(Symbol(),PERIOD_M5,1) ;
   if ( 林_108_in_2D4 == 1 )
   {
     ccbsw_28(); 
   }
   else
   {
     if ( 林_108_in_2D4 == 2 )
     {
       ccbsw_29(); 
     }
   }
   ccbsw_25(); 
   ccbsw_26(); 
 }
 林_378_in_55A4 ++;
 if ( 林_378_in_55A4 < 2 )   return;
 林_311_do_20E8 = AccountBalance() ;
 林_378_in_55A4 = 0 ;
 }
//OnTick <<==--------   --------
 int deinit()
 {
 ccbsw_23(); 
 return(0); 
 }
//deinit <<==--------   --------
 int ccbsw_6( int 胜_0_in)
 {
  bool      文_2_bo;
  int       文_3_in;
  int       文_4_in;
//----- -----
 int        轩_in_1;
 int        轩_in_2;
 int        轩_in_3;
 int        轩_in_4;
 int        轩_in_5;
 int        轩_in_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;
 int        轩_in_11;
 int        轩_in_12;
 int        轩_in_13;
 int        轩_in_14;
 int        轩_in_15;
 int        轩_in_16;
 int        轩_in_17;
 int        轩_in_18;
 int        轩_in_19;
 int        轩_in_20;
 int        轩_in_21;
 int        轩_in_22;
 int        轩_in_23;
 int        轩_in_24;
 int        轩_in_25;
 int        轩_in_26;
 int        轩_in_27;
 int        轩_in_28;
 int        轩_in_29;
 int        轩_in_30;
 int        轩_in_31;
 int        轩_in_32;
 int        轩_in_33;
 int        轩_in_34;
 int        轩_in_35;
 int        轩_in_36;
 int        轩_in_37;
 int        轩_in_38;
 int        轩_in_39;
 int        轩_in_40;
 double     轩_do_41;
 int        轩_in_42;
 int        轩_in_43;
 int        轩_in_44;
 int        轩_in_45;
 int        轩_in_46;
 int        轩_in_47;
 double     轩_do_48;
 int        轩_in_49;
 int        轩_in_50;
 int        轩_in_51;
 int        轩_in_52;
 int        轩_in_53;
 int        轩_in_54;
 int        轩_in_55;
 int        轩_in_56;
 bool       轩_bo_57;
 int        轩_in_58;
 int        轩_in_59;
 int        轩_in_60;
 long       轩_lo_61;
 long       轩_lo_62;
 bool       轩_bo_63;
 int        轩_in_64;
 double     轩_do_65;
 int        轩_in_66;
 string     轩_st_67;
 int        轩_in_68;
 int        轩_in_69;
 int        轩_in_70;
 int        轩_in_71;

 林_321_in_2910 = 胜_0_in ;
 文_2_bo = false ;
 林_305_bo_20C0 = true ;
 if ( 林_49_do_110>0.0 )
 {
   林_48_do_108 = 林_49_do_110 / 100.0 * MarketInfo(林_330_st_2940,MODE_ASK) * 10.0 ;
 }
 if ( 林_68_in_19C == 0 )
 {
   if ( ccbsw_16() )
   {
     文_2_bo = true ;
   }
   if ( ccbsw_17() )
   {
     文_2_bo = true ;
   }
   if ( 文_2_bo )
   {
     return(0); 
   }
 }
 else
 {
   if ( 林_314_in_2130_si99[林_321_in_2910] != iBars(林_330_st_2940,林_68_in_19C) )
   {
     林_314_in_2130_si99[林_321_in_2910] = iBars(林_330_st_2940,林_68_in_19C);
     if ( ccbsw_16() )
     {
       文_2_bo = true ;
     }
     if ( ccbsw_17() )
     {
       文_2_bo = true ;
     }
     if ( 文_2_bo )
     {
       return(0); 
     }
   }
 }
 ccbsw_20(false); 
 if ( !(IsTesting()) && MarketInfo(林_330_st_2940,MODE_TRADEALLOWED)==0.0 )
 {
   if ( !(林_239_bo_1D74) )
   {
     Print("Market closed... waiting to continue"); 
   }
   林_239_bo_1D74 = true ;
   return(0); 
 }
 if ( 林_35_in_CC >  0 && ( ( Hour() == 0 && Minute() < 林_35_in_CC ) || (Hour() == 23 && 林_35_in_CC >  60 - 林_35_in_CC) ) )
 {
   if ( !(林_239_bo_1D74) )
   {
     Print("DAYSWITCH -> Market might be closed... waiting " + string(林_35_in_CC) + " minutes before setting order.."); 
   }
   林_239_bo_1D74 = true ;
   return(0); 
 }
 林_239_bo_1D74 = false ;
 if ( 林_128_bo_354 )
 {
   if ( ccbsw_18() && 林_295_bo_2088 )
   {
     if ( 林_130_bo_35C )
     {
       ccbsw_7(); 
     }
     林_295_bo_2088 = false ;
   }
   if ( !(ccbsw_18()) && !(林_295_bo_2088) )
   {
     Print("ENTERING NON-TRADING HOURS! Closing orders..."); 
     if ( 林_130_bo_35C )
     {
       for (轩_in_1 = 0 ; 轩_in_1 < 林_157_in_154C ; 轩_in_1=轩_in_1 + 1)
       {
         for (轩_in_2 = 0 ; 轩_in_2 < 2 ; 轩_in_2=轩_in_2 + 1)
         {
           林_154_do_574_si100si3[轩_in_1][轩_in_2] = 0.0;
         }
       }
       轩_in_3 = 0;
       for (轩_in_4 = OrdersTotal() ; 轩_in_4 >= 0 ; 轩_in_4=轩_in_4 - 1)
       {
         if ( OrderSelect(轩_in_4,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
         
         if ( ( OrderType() != 4 && OrderType() != 5 ) )   continue;
         Print("Storing pending order nr " + string(OrderTicket())); 
         林_154_do_574_si100si3[轩_in_3][1] = OrderType();
         林_154_do_574_si100si3[轩_in_3][0] = OrderOpenPrice();
         林_154_do_574_si100si3[轩_in_3][2] = OrderLots();
         轩_in_3=轩_in_3 + 1;
         
       }
     }
     轩_in_5 = 1;
     for (轩_in_6 = OrdersTotal() ; 轩_in_6 >= 0 ; 轩_in_6=轩_in_6 - 1)
     {
       if ( OrderSelect(轩_in_6,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_5 == 2 )
     {
       for (轩_in_7 = OrdersTotal() ; 轩_in_7 >= 0 ; 轩_in_7=轩_in_7 - 1)
       {
         if ( OrderSelect(轩_in_7,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_8 = 1;
     for (轩_in_9 = OrdersTotal() ; 轩_in_9 >= 0 ; 轩_in_9=轩_in_9 - 1)
     {
       if ( OrderSelect(轩_in_9,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_8 == 2 )
     {
       for (轩_in_10 = OrdersTotal() ; 轩_in_10 >= 0 ; 轩_in_10=轩_in_10 - 1)
       {
         if ( OrderSelect(轩_in_10,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_11 = 2;
     if(轩_in_11 == 1)
     {
     for (轩_in_9 = OrdersTotal() ; 轩_in_9 >= 0 ; 轩_in_9=轩_in_9 - 1)
     {
       if ( OrderSelect(轩_in_9,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF);        
     }       
     }
     if ( 轩_in_11 == 2 )
     {
       for (轩_in_12 = OrdersTotal() ; 轩_in_12 >= 0 ; 轩_in_12=轩_in_12 - 1)
       {
         if ( OrderSelect(轩_in_12,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_13 = 2;
     if(轩_in_13 == 1) 
     {
     for (轩_in_9 = OrdersTotal() ; 轩_in_9 >= 0 ; 轩_in_9=轩_in_9 - 1)
     {
       if ( OrderSelect(轩_in_9,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }       
     }
     if ( 轩_in_13 == 2 )
     {
       for (轩_in_14 = OrdersTotal() ; 轩_in_14 >= 0 ; 轩_in_14=轩_in_14 - 1)
       {
         if ( OrderSelect(轩_in_14,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     林_295_bo_2088 = true ;
     return(0); 
   }
 }
 if ( 林_25_bo_95 && Day() <= 7 && DayOfWeek() == 5 )
 {
   if ( Hour() >= 林_26_in_98 && Hour() <  林_27_in_9C )
   {
     轩_in_15 = 1;
     for (轩_in_16 = OrdersTotal() ; 轩_in_16 >= 0 ; 轩_in_16=轩_in_16 - 1)
     {
       if ( OrderSelect(轩_in_16,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_15 == 2 )
     {
       for (轩_in_17 = OrdersTotal() ; 轩_in_17 >= 0 ; 轩_in_17=轩_in_17 - 1)
       {
         if ( OrderSelect(轩_in_17,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_18 = 1;
     for (轩_in_19 = OrdersTotal() ; 轩_in_19 >= 0 ; 轩_in_19=轩_in_19 - 1)
     {
       if ( OrderSelect(轩_in_19,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_18 == 2 )
     {
       for (轩_in_20 = OrdersTotal() ; 轩_in_20 >= 0 ; 轩_in_20=轩_in_20 - 1)
       {
         if ( OrderSelect(轩_in_20,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_21 = 2;
     if(轩_in_21 == 1) 
     {
      for (轩_in_16 = OrdersTotal() ; 轩_in_16 >= 0 ; 轩_in_16=轩_in_16 - 1)
      {
       if ( OrderSelect(轩_in_16,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF);       
      }       
     }
     if ( 轩_in_21 == 2 )
     {
       for (轩_in_22 = OrdersTotal() ; 轩_in_22 >= 0 ; 轩_in_22=轩_in_22 - 1)
       {
         if ( OrderSelect(轩_in_22,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_23 = 2;
     if(轩_in_23 == 1)
     {
     for (轩_in_16 = OrdersTotal() ; 轩_in_16 >= 0 ; 轩_in_16=轩_in_16 - 1)
      {
       if ( OrderSelect(轩_in_16,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
      }       
     }
     if ( 轩_in_23 == 2 )
     {
       for (轩_in_24 = OrdersTotal() ; 轩_in_24 >= 0 ; 轩_in_24=轩_in_24 - 1)
       {
         if ( OrderSelect(轩_in_24,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     if ( !(林_313_bo_20F8) )
     {
       Print("NFP!! deleting trades!!"); 
     }
     林_313_bo_20F8 = true ;
   }
   else
   {
     林_313_bo_20F8 = false ;
   }
 }
 if ( 林_313_bo_20F8 )
 {
   return(0); 
 }
 if ( 林_22_bo_8C )
 {
   if ( DayOfWeek() == 5 && Hour() >= 林_23_in_90 && !(林_297_bo_2090) )
   {
     if ( 林_24_bo_94 )
     {
       for (轩_in_25 = 0 ; 轩_in_25 < 林_157_in_154C ; 轩_in_25=轩_in_25 + 1)
       {
         for (轩_in_26 = 0 ; 轩_in_26 < 2 ; 轩_in_26=轩_in_26 + 1)
         {
           林_154_do_574_si100si3[轩_in_25][轩_in_26] = 0.0;
         }
       }
       轩_in_27 = 0;
       for (轩_in_28 = OrdersTotal() ; 轩_in_28 >= 0 ; 轩_in_28=轩_in_28 - 1)
       {
         if ( OrderSelect(轩_in_28,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
         
         if ( ( OrderType() != 4 && OrderType() != 5 ) )   continue;
         Print("Storing pending order nr " + string(OrderTicket())); 
         林_154_do_574_si100si3[轩_in_27][1] = OrderType();
         林_154_do_574_si100si3[轩_in_27][0] = OrderOpenPrice();
         林_154_do_574_si100si3[轩_in_27][2] = OrderLots();
         轩_in_27=轩_in_27 + 1;
         
       }
     }
     轩_in_29 = 1;
     for (轩_in_30 = OrdersTotal() ; 轩_in_30 >= 0 ; 轩_in_30=轩_in_30 - 1)
     {
       if ( OrderSelect(轩_in_30,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_29 == 2 )
     {
       for (轩_in_31 = OrdersTotal() ; 轩_in_31 >= 0 ; 轩_in_31=轩_in_31 - 1)
       {
         if ( OrderSelect(轩_in_31,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_32 = 1;
     for (轩_in_33 = OrdersTotal() ; 轩_in_33 >= 0 ; 轩_in_33=轩_in_33 - 1)
     {
       if ( OrderSelect(轩_in_33,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }
     if ( 轩_in_32 == 2 )
     {
       for (轩_in_34 = OrdersTotal() ; 轩_in_34 >= 0 ; 轩_in_34=轩_in_34 - 1)
       {
         if ( OrderSelect(轩_in_34,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_35 = 2;
     if(轩_in_35 == 1) 
     {
     for (轩_in_30 = OrdersTotal() ; 轩_in_30 >= 0 ; 轩_in_30=轩_in_30 - 1)
     {
       if ( OrderSelect(轩_in_30,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }     
     }
     if ( 轩_in_35 == 2 )
     {
       for (轩_in_36 = OrdersTotal() ; 轩_in_36 >= 0 ; 轩_in_36=轩_in_36 - 1)
       {
         if ( OrderSelect(轩_in_36,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     轩_in_37 = 2;
     if(轩_in_37 == 1) 
     {
     for (轩_in_30 = OrdersTotal() ; 轩_in_30 >= 0 ; 轩_in_30=轩_in_30 - 1)
     {
       if ( OrderSelect(轩_in_30,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       OrderDelete(OrderTicket(),0xFFFFFFFF); 
       
     }      
     }
     if ( 轩_in_37 == 2 )
     {
       for (轩_in_38 = OrdersTotal() ; 轩_in_38 >= 0 ; 轩_in_38=轩_in_38 - 1)
       {
         if ( OrderSelect(轩_in_38,0,0) != true || OrderMagicNumber() != 林_65_in_178 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
         OrderDelete(OrderTicket(),0xFFFFFFFF); 
         
       }
     }
     Print("Weekend starting! Stopping trades.."); 
     林_297_bo_2090 = true ;
     return(0); 
   }
   if ( DayOfWeek() != 5 && 林_297_bo_2090 == true )
   {
     林_297_bo_2090 = false ;
     if ( 林_24_bo_94 )
     {
       ccbsw_7(); 
       return(0); 
     }
   }
 }
 林_1_do_0 = MarketInfo(林_330_st_2940,MODE_ASK) - MarketInfo(林_330_st_2940,MODE_BID) ;
 if ( 林_12_bo_3D )
 {
   if ( 林_1_do_0>MaxSpread * 林_201_do_1C98 )
   {
     ccbsw_8(); 
     return(0); 
   }
   if ( 林_1_do_0<=林_14_do_48 * 林_201_do_1C98 && ( !(林_22_bo_8C) || DayOfWeek() != 5 || Hour() <  林_23_in_90 ) && ( !(林_128_bo_354) || ccbsw_18() ) )
   {
     ccbsw_7(); 
   }
 }
 if ( 林_37_in_D4 == 1 )
 {
   轩_in_39 = 0;
   for (轩_in_40 = OrdersTotal() ; 轩_in_40 >= 0 ; 轩_in_40=轩_in_40 - 1)
   {
     if ( OrderSelect(轩_in_40,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
     轩_in_39=轩_in_39 + 1;
     
   }
   if ( 轩_in_39 >  林_55_in_138 )
   {
     轩_do_41 = 0.0;
     轩_in_42 = 0;
     for (轩_in_43 = OrdersTotal() ; 轩_in_43 >= 0 ; 轩_in_43=轩_in_43 - 1)
     {
       if ( OrderSelect(轩_in_43,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 || !(OrderOpenPrice()>轩_do_41) )   continue;
       轩_in_42 = OrderTicket();
       轩_do_41 = OrderOpenPrice();
       
     }
     if ( 轩_in_42 != 0 )
     {
       OrderDelete(轩_in_42,Green); 
       轩_in_44 = 轩_in_42;
       for (轩_in_45 = 0 ; 轩_in_45 < 100 ; 轩_in_45=轩_in_45 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_45][0]==轩_in_44) )   continue;
         林_155_do_F08_si100si2[轩_in_45][0] = 0.0;
         林_155_do_F08_si100si2[轩_in_45][1] = 0.0;
         break;
         
       }
       Print("Max number of pending buy orders reached... deleting highest buystop order!"); 
     }
   }
   轩_in_46 = 0;
   for (轩_in_47 = OrdersTotal() ; 轩_in_47 >= 0 ; 轩_in_47=轩_in_47 - 1)
   {
     if ( OrderSelect(轩_in_47,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
     轩_in_46=轩_in_46 + 1;
     
   }
   if ( 轩_in_46 >  林_55_in_138 )
   {
     轩_do_48 = 9999.0;
     轩_in_49 = 0;
     for (轩_in_50 = OrdersTotal() ; 轩_in_50 >= 0 ; 轩_in_50=轩_in_50 - 1)
     {
       if ( OrderSelect(轩_in_50,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 || !(OrderOpenPrice()<轩_do_48) )   continue;
       轩_in_49 = OrderTicket();
       轩_do_48 = OrderOpenPrice();
       
     }
     if ( 轩_in_49 != 0 )
     {
       OrderDelete(轩_in_49,Green); 
       轩_in_51 = 轩_in_49;
       for (轩_in_52 = 0 ; 轩_in_52 < 100 ; 轩_in_52=轩_in_52 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_52][0]==轩_in_51) )   continue;
         林_155_do_F08_si100si2[轩_in_52][0] = 0.0;
         林_155_do_F08_si100si2[轩_in_52][1] = 0.0;
         break;
         
       }
       Print("Max number of pending sell orders reached... deleting lowest sellstop order!"); 
     }
   }
 }
 if ( !(林_297_bo_2090) && 林_37_in_D4 == 1 && !(林_295_bo_2088) )
 {
   if ( ( 林_315_in_22F0_si99[林_321_in_2910] != iBars(林_330_st_2940,林_40_in_E8) || 林_40_in_E8 == 0 ) )
   {
     林_315_in_22F0_si99[林_321_in_2910] = iBars(林_330_st_2940,林_40_in_E8);
     if ( 林_84_in_220 >  0 && 林_85_in_224 >= 0 )
     {
       林_218_do_1CE0 = 林_87_do_230 * 林_201_do_1C98 + (ccbsw_12(林_82_in_218,林_84_in_220,林_85_in_224) + 林_1_do_0) ;
       林_219_do_1CE8 = ccbsw_13(林_82_in_218,林_84_in_220,林_85_in_224) - 林_87_do_230 * 林_201_do_1C98 ;
     }
     if ( 林_144_in_39C >  0 )
     {
       文_3_in=MathRand() * 林_144_in_39C / 32768 + 1;
       林_7_in_18 = 文_3_in ;
       Print("Slippage: " + string(文_3_in)); 
     }
     if ( 林_30_in_B0 != 1 )
     {
       轩_in_53 = 0;
       for (轩_in_54 = OrdersTotal() ; 轩_in_54 >= 0 ; 轩_in_54=轩_in_54 - 1)
       {
         if ( OrderSelect(轩_in_54,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 0 )   continue;
         轩_in_53=轩_in_53 + 1;
         
       }
       if ( 轩_in_53 == 0 )
       {
         轩_in_55 = 0;
         for (轩_in_56 = OrdersTotal() ; 轩_in_56 >= 0 ; 轩_in_56=轩_in_56 - 1)
         {
           if ( OrderSelect(轩_in_56,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 1 )   continue;
           轩_in_55=轩_in_55 + 1;
           
         }
         if ( 轩_in_55 == 0 )
         {
           轩_bo_57 = false;
           for (轩_in_58 = 0 ; 轩_in_58 < 林_156_in_1548 ; 轩_in_58=轩_in_58 + 1)
           {
             if ( !(林_153_do_400_si20si2[轩_in_58][0]>0.0) )   continue;
             轩_bo_57 = false;
             for (轩_in_59 = OrdersTotal() ; 轩_in_59 >= 0 ; 轩_in_59=轩_in_59 - 1)
             {
               if ( OrderSelect(轩_in_59,0,0) != true )   continue;
               
               if ( ( OrderType() != 0 && OrderType() != 1 ) || !(OrderTicket()==林_153_do_400_si20si2[轩_in_58][0]) )   continue;
               轩_bo_57 = true;
               
             }
             if ( 轩_bo_57 )   continue;
             林_153_do_400_si20si2[轩_in_58][0] = 0.0;
             林_153_do_400_si20si2[轩_in_58][1] = 0.0;
             
           }
         }
       }
     }
     for (文_4_in = 0 ; 文_4_in < 林_55_in_138 ; 文_4_in ++)
     {
       if ( 林_180_bo_15A8 )
       {
         林_251_do_1DB8 = iMA(林_330_st_2940,0,林_181_in_15AC,0,1,0,1) ;
         林_252_do_1DC0 = iMA(林_330_st_2940,0,林_185_in_1908,0,1,0,1) ;
       }
       ccbsw_9(林_69_do_1A0,林_61_in_15C); 
       if ( 林_192_do_195C_si99[林_321_in_2910]>林_102_do_2A8 )
       {
         林_192_do_195C_si99[林_321_in_2910] = 林_102_do_2A8;
       }
       if ( 林_57_in_148 >  0 )
       {
         林_294_da_2080=TimeCurrent() + 林_208_in_1CB8;
       }
       if ( Virtual_expiration )
       {
         林_294_da_2080 = 0 ;
         for (轩_in_60 = OrdersTotal() ; 轩_in_60 >= 0 ; 轩_in_60=轩_in_60 - 1)
         {
           if ( OrderSelect(轩_in_60,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
           
           if ( ( OrderType() != 4 && OrderType() != 5 ) )   continue;
           轩_lo_61 = TimeCurrent();
           轩_lo_62=OrderOpenTime() + 林_208_in_1CB8;
           if ( 轩_lo_61 < 轩_lo_62 )   continue;
           OrderDelete(OrderTicket(),Red); 
           
         }
       }
       ccbsw_14(1); 
       ccbsw_15(1); 
     }
   }
   ccbsw_26(); 
   if ( 林_250_in_1DB0 != Hour() )
   {
     林_250_in_1DB0 = Hour() ;
     轩_bo_63 = false;
     for (轩_in_64 = 0 ; 轩_in_64 < 100 ; 轩_in_64=轩_in_64 + 1)
     {
       轩_do_65 = 林_155_do_F08_si100si2[轩_in_64][0];
       轩_bo_63 = false;
       for (轩_in_66 = OrdersTotal() ; 轩_in_66 >= 0 ; 轩_in_66=轩_in_66 - 1)
       {
         if ( !(OrderSelect(轩_in_66,0,0)) || 轩_do_65 != OrderTicket() )   continue;
         轩_bo_63 = true;
         
       }
       if ( 轩_bo_63 )   continue;
       林_155_do_F08_si100si2[轩_in_64][0] = 0.0;
       林_155_do_F08_si100si2[轩_in_64][1] = 0.0;
       
     }
   }
 }
 if ( 林_29_bo_AC )
 {
   轩_st_67="Current spread: " + string(NormalizeDouble(林_1_do_0 / 林_201_do_1C98,1)) + "\nPending Buy Order: ";
   轩_in_68 = 0;
   for (轩_in_69 = OrdersTotal() ; 轩_in_69 >= 0 ; 轩_in_69=轩_in_69 - 1)
   {
     if ( OrderSelect(轩_in_69,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
     轩_in_68=轩_in_68 + 1;
     
   }
   轩_st_67=轩_st_67 + string(轩_in_68);
   轩_st_67=轩_st_67 + "\nPending Sell Orders: ";
   轩_in_70 = 0;
   for (轩_in_71 = OrdersTotal() ; 轩_in_71 >= 0 ; 轩_in_71=轩_in_71 - 1)
   {
     if ( OrderSelect(轩_in_71,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
     轩_in_70=轩_in_70 + 1;
     
   }
   轩_st_67=轩_st_67 + string(轩_in_70);
   Comment(轩_st_67); 
 }
 return(0); 
 }
//ccbsw_6 <<==--------   --------
 void ccbsw_7()
 {
  int       文_1_in;
//----- -----
 double     轩_do_1;
 int        轩_in_2;
 int        轩_in_3;
 double     轩_do_4;
 int        轩_in_5;
 int        轩_in_6;
 double     轩_do_7;
 int        轩_in_8;
 int        轩_in_9;
 double     轩_do_10;
 int        轩_in_11;
 int        轩_in_12;
 int        轩_in_13;

 for (文_1_in = 0 ; 文_1_in < 林_157_in_154C ; 文_1_in ++)
 {
   if ( !(林_154_do_574_si100si3[文_1_in][0]>0.0) )   continue;
   
   if ( 林_154_do_574_si100si3[文_1_in][1]==4.0 && MarketInfo(林_330_st_2940,MODE_ASK)<林_154_do_574_si100si3[文_1_in][0] - 林_189_do_1918 )
   {
     Print("Restoring pending buy-order"); 
     林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_154_do_574_si100si3[文_1_in][2],林_154_do_574_si100si3[文_1_in][0],int(林_15_do_50 * 林_201_do_1C98),林_154_do_574_si100si3[文_1_in][0] - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98,林_70_do_1A8 * 林_201_do_1C98 + 林_154_do_574_si100si3[文_1_in][0],林_328_st_2930,林_62_in_160,林_294_da_2080 + 172800,Green) ;
     林_266_bo_1E0A = false ;
     轩_do_1 = 林_154_do_574_si100si3[文_1_in][0];
     轩_in_2 = 林_202_in_1CA0;
     for (轩_in_3 = 0 ; 轩_in_3 < 100 ; 轩_in_3=轩_in_3 + 1)
     {
       if ( !(林_155_do_F08_si100si2[轩_in_3][0]==0.0) )   continue;
       林_155_do_F08_si100si2[轩_in_3][0] = 轩_in_2;
       林_155_do_F08_si100si2[轩_in_3][1] = 轩_do_1;
       break;
       
     }
     if ( 林_202_in_1CA0 <= 0 )
     {
       if ( GetLastError() == 132 )
       {
         ResetLastError();
         if(1==0) //条件不成立
         {
           do
           {
             Sleep(2500); 
             林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_154_do_574_si100si3[文_1_in][2],林_154_do_574_si100si3[文_1_in][0],int(林_15_do_50 * 林_201_do_1C98),林_154_do_574_si100si3[文_1_in][0] - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98,林_70_do_1A8 * 林_201_do_1C98 + 林_154_do_574_si100si3[文_1_in][0],林_328_st_2930,林_62_in_160,林_294_da_2080 + 172800,Green) ;
             林_266_bo_1E0A = false ;
             轩_do_4 = 林_154_do_574_si100si3[文_1_in][0];
             轩_in_5 = 林_202_in_1CA0;
             for (轩_in_6 = 0 ; 轩_in_6 < 100 ; 轩_in_6=轩_in_6 + 1)
             {
               if ( !(林_155_do_F08_si100si2[轩_in_6][0]==0.0) )   continue;
               林_155_do_F08_si100si2[轩_in_6][0] = 轩_in_5;
               林_155_do_F08_si100si2[轩_in_6][1] = 轩_do_4;
               break;
               
             }
           }
           while(GetLastError() == 132);
           
         }
       }
       Print("error: \'" + ccbsw_19(GetLastError()) + "\' when setting entry order"); 
     }
   }
   if ( !(林_154_do_574_si100si3[文_1_in][1]==5.0) || !(MarketInfo(林_330_st_2940,MODE_BID)>林_154_do_574_si100si3[文_1_in][0] + 林_189_do_1918) )   continue;
   Print("Restoring pending sell-order"); 
   林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_154_do_574_si100si3[文_1_in][2],林_154_do_574_si100si3[文_1_in][0],int(林_15_do_50 * 林_201_do_1C98),(林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 林_154_do_574_si100si3[文_1_in][0],林_154_do_574_si100si3[文_1_in][0] - 林_70_do_1A8 * 林_201_do_1C98,林_328_st_2930,林_62_in_160,林_294_da_2080 + 172800,Green) ;
   林_267_bo_1E0B = false ;
   轩_do_7 = 林_154_do_574_si100si3[文_1_in][0];
   轩_in_8 = 林_202_in_1CA0;
   for (轩_in_9 = 0 ; 轩_in_9 < 100 ; 轩_in_9=轩_in_9 + 1)
   {
     if ( !(林_155_do_F08_si100si2[轩_in_9][0]==0.0) )   continue;
     林_155_do_F08_si100si2[轩_in_9][0] = 轩_in_8;
     林_155_do_F08_si100si2[轩_in_9][1] = 轩_do_7;
     break;
     
   }
   if ( 林_202_in_1CA0 > 0 )   continue;
   
   if ( GetLastError() == 132 )
   {
     ResetLastError();
     if(1==0) //条件不成立
     {
       do
       {
         Sleep(2500); 
         林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_154_do_574_si100si3[文_1_in][2],林_154_do_574_si100si3[文_1_in][0],int(林_15_do_50 * 林_201_do_1C98),(林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 林_154_do_574_si100si3[文_1_in][0],林_154_do_574_si100si3[文_1_in][0] - 林_70_do_1A8 * 林_201_do_1C98,林_328_st_2930,林_62_in_160,林_294_da_2080 + 172800,Green) ;
         林_267_bo_1E0B = false ;
         轩_do_10 = 林_154_do_574_si100si3[文_1_in][0];
         轩_in_11 = 林_202_in_1CA0;
         for (轩_in_12 = 0 ; 轩_in_12 < 100 ; 轩_in_12=轩_in_12 + 1)
         {
           if ( !(林_155_do_F08_si100si2[轩_in_12][0]==0.0) )   continue;
           林_155_do_F08_si100si2[轩_in_12][0] = 轩_in_11;
           林_155_do_F08_si100si2[轩_in_12][1] = 轩_do_10;
           break;
           
         }
       }
       while(GetLastError() == 132);
       
     }
   }
   Print("error: \'" + ccbsw_19(GetLastError()) + "\' when setting entry order"); 
   
 }
 for (轩_in_13 = 0 ; 轩_in_13 < 林_157_in_154C ; 轩_in_13=轩_in_13 + 1)
 {
   林_154_do_574_si100si3[轩_in_13][0] = 0.0;
   林_154_do_574_si100si3[轩_in_13][1] = 0.0;
   林_154_do_574_si100si3[轩_in_13][2] = 0.0;
 }
 }
//ccbsw_7 <<==--------   --------
 int ccbsw_8()
 {
  int       文_2_in;
  int       文_3_in;
  int       文_4_in;
//----- -----
 int        轩_in_1;
 int        轩_in_2;
 int        轩_in_3;
 int        轩_in_4;
 double     轩_do_5;
 double     轩_do_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;

 for (文_2_in = OrdersTotal() ; 文_2_in >= 0 ; 文_2_in --)
 {
   if ( OrderSelect(文_2_in,0,0) != true )   continue;
   
   if ( ( OrderMagicNumber() != 林_62_in_160 && OrderMagicNumber() != 林_65_in_178 ) || OrderSymbol() != 林_330_st_2940 )   continue;
   
   if ( OrderType() == 4 && OrderOpenPrice()<林_13_in_40 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) && MarketInfo(林_330_st_2940,MODE_ASK)<OrderOpenPrice() - 林_302_do_20A8 )
   {
     if ( 林_14_do_48>0.0 )
     {
       Print("Spread too high..(" + string(林_1_do_0) + ") storing and deleting order " + string(OrderTicket())); 
       for (文_3_in = 0 ; 文_3_in < 林_157_in_154C ; 文_3_in ++)
       {
         if ( 林_154_do_574_si100si3[文_3_in][0]==0.0 )
         {
           Print("Storing pending order nr " + string(OrderTicket())); 
           林_154_do_574_si100si3[文_3_in][1] = OrderType();
           林_154_do_574_si100si3[文_3_in][0] = OrderOpenPrice();
           林_154_do_574_si100si3[文_3_in][2] = OrderLots();
           break;
         }
       }
       轩_in_1 = OrderTicket();
       for (轩_in_2 = 0 ; 轩_in_2 < 100 ; 轩_in_2=轩_in_2 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_2][0]==轩_in_1) )   continue;
         林_155_do_F08_si100si2[轩_in_2][0] = 0.0;
         林_155_do_F08_si100si2[轩_in_2][1] = 0.0;
         break;
         
       }
       OrderDelete(OrderTicket(),Green); 
     }
     else
     {
       Print("Spread too high..(" + string(林_1_do_0) + ") deleting order " + string(OrderTicket())); 
       轩_in_3 = OrderTicket();
       for (轩_in_4 = 0 ; 轩_in_4 < 100 ; 轩_in_4=轩_in_4 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_4][0]==轩_in_3) )   continue;
         林_155_do_F08_si100si2[轩_in_4][0] = 0.0;
         林_155_do_F08_si100si2[轩_in_4][1] = 0.0;
         break;
         
       }
       OrderDelete(OrderTicket(),Green); 
     }
   }
   if ( OrderType() != 5 )   continue;
   轩_do_5 = OrderOpenPrice();
   if ( !(轩_do_5>MarketInfo(林_330_st_2940,MODE_BID) - 林_13_in_40 * 林_201_do_1C98) )   continue;
   轩_do_6 = MarketInfo(林_330_st_2940,MODE_BID);
   if ( !(轩_do_6>OrderOpenPrice() + 林_302_do_20A8) )   continue;
   
   if ( 林_14_do_48>0.0 )
   {
     Print("Spread too high..(" + string(林_1_do_0) + ") storing and deleting order " + string(OrderTicket())); 
     for (文_4_in = 0 ; 文_4_in < 林_157_in_154C ; 文_4_in ++)
     {
       if ( 林_154_do_574_si100si3[文_4_in][0]==0.0 )
       {
         Print("Storing pending order nr " + string(OrderTicket())); 
         林_154_do_574_si100si3[文_4_in][1] = OrderType();
         林_154_do_574_si100si3[文_4_in][0] = OrderOpenPrice();
         林_154_do_574_si100si3[文_4_in][2] = OrderLots();
         break;
       }
     }
     轩_in_7 = OrderTicket();
     for (轩_in_8 = 0 ; 轩_in_8 < 100 ; 轩_in_8=轩_in_8 + 1)
     {
       if ( !(林_155_do_F08_si100si2[轩_in_8][0]==轩_in_7) )   continue;
       林_155_do_F08_si100si2[轩_in_8][0] = 0.0;
       林_155_do_F08_si100si2[轩_in_8][1] = 0.0;
       break;
       
     }
     OrderDelete(OrderTicket(),Green); 
      continue;
   }
   Print("Spread too high..(" + string(林_1_do_0) + ") deleting order " + string(OrderTicket())); 
   轩_in_9 = OrderTicket();
   for (轩_in_10 = 0 ; 轩_in_10 < 100 ; 轩_in_10=轩_in_10 + 1)
   {
     if ( !(林_155_do_F08_si100si2[轩_in_10][0]==轩_in_9) )   continue;
     林_155_do_F08_si100si2[轩_in_10][0] = 0.0;
     林_155_do_F08_si100si2[轩_in_10][1] = 0.0;
     break;
     
   }
   OrderDelete(OrderTicket(),Green); 
   
 }
 return(false);//文_1_bo = false ;
 }
//ccbsw_8 <<==--------   --------
 void ccbsw_9( double 胜_0_do,int 胜_1_in)
 {
  double    文_1_do;
  double    文_2_do;
  double    文_3_do;
  double    文_4_do;
  double    文_5_do;
  double    文_6_do;
  double    文_7_do;
//----- -----

 文_1_do = 林_192_do_195C_si99[林_321_in_2910] ;
 文_2_do = 林_192_do_195C_si99[林_321_in_2910] ;
 文_3_do = AccountBalance() ;
 if ( UseEquity )
 {
   文_3_do = AccountEquity() ;
 }
 文_4_do = 胜_0_do ;
 if ( ( 林_147_in_3B0 == 2 || 林_147_in_3B0 == 4 ) )
 {
   文_4_do = 胜_0_do / 10.0 ;
 }
 if ( Risk <  999 && Risk >  0 )
 {
   文_5_do = Risk ;
   文_6_do = 文_5_do / 1000.0 * 文_3_do ;
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_6_do / (MarketInfo(林_330_st_2940,MODE_TICKVALUE) * 文_4_do) * 0.1),1) ;
   }
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.01 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_6_do / (MarketInfo(林_330_st_2940,MODE_TICKVALUE) * 文_4_do) * 0.1),2) ;
   }
 }
 if ( Risk == 999 )
 {
   文_7_do = Manual_RiskPerTrade / 100.0 * 文_3_do ;
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_7_do / (MarketInfo(林_330_st_2940,MODE_TICKVALUE) * 文_4_do) * 0.1),1) ;
   }
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.01 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_7_do / (MarketInfo(林_330_st_2940,MODE_TICKVALUE) * 文_4_do) * 0.1),2) ;
   }
 }
 if ( Risk == 0 )
 {
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * StartLots,1) ;
   }
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.01 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * StartLots,2) ;
   }
 }
 if ( Risk == 9999 )
 {
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_3_do / LotPerBalance_step * 0.01),1) ;
   }
   if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.01 )
   {
     文_2_do = NormalizeDouble(胜_1_in * 0.01 * (文_3_do / LotPerBalance_step * 0.01),2) ;
   }
 }
 if ( Risk == 99999 )
 {
   if ( SymbolInfoDouble(林_330_st_2940,36)==0.1 )
   {
     文_2_do = NormalizeDouble(林_104_do_2B8 / 林_332_do_2958 * AccountInfoDouble(ACCOUNT_BALANCE) / 100.0 * 0.01,1) ;
   }
   if ( SymbolInfoDouble(林_330_st_2940,36)==0.01 )
   {
     文_2_do = NormalizeDouble(林_104_do_2B8 / 林_332_do_2958 * AccountInfoDouble(ACCOUNT_BALANCE) / 100.0 * 0.01,2) ;
   }
 }
 if ( 文_2_do<MarketInfo(林_330_st_2940,MODE_LOTSTEP) )
 {
   文_2_do = MarketInfo(林_330_st_2940,MODE_LOTSTEP) ;
 }
 if ( 文_2_do<StartLots )
 {
   文_2_do = StartLots ;
 }
 if ( 文_2_do>林_102_do_2A8 )
 {
   文_2_do = 林_102_do_2A8 ;
 }
 if ( OnlyUp && 文_2_do<文_1_do )
 {
   文_2_do = 文_1_do ;
 }
 if ( 文_2_do<MarketInfo(林_330_st_2940,MODE_MINLOT) )
 {
   Print("Minimum lotsize (" + 林_330_st_2940 + ") for this broker is " + string(MarketInfo(林_330_st_2940,MODE_MINLOT)) + " lots!!"); 
 }
 if ( 文_2_do>MarketInfo(林_330_st_2940,MODE_MAXLOT) && MarketInfo(林_330_st_2940,MODE_MAXLOT)!=0.0 )
 {
   Print("Maximum lotsize for this broker is " + string(MarketInfo(林_330_st_2940,MODE_MAXLOT)) + " lots!!"); 
   文_2_do = MarketInfo(林_330_st_2940,MODE_MAXLOT) ;
 }
 if ( MarketInfo(林_330_st_2940,MODE_LOTSTEP)==0.1 )
 {
   林_192_do_195C_si99[林_321_in_2910] = NormalizeDouble((MathFloor(文_2_do * 10.0)) / 10.0,1);
   return;
 }
 林_192_do_195C_si99[林_321_in_2910] = NormalizeDouble(MathFloor(文_2_do * 100.0) / 100.0,2);
 }
//ccbsw_9 <<==--------   --------
 double ccbsw_10( int 胜_0_in)
 {
  bool      文_2_bo = false;
  bool      文_3_bo = false;
  bool      文_4_bo;
  int       文_5_in;
  int       文_6_in;
  int       文_7_in;
//----- -----
 double     轩_do_1;
 int        轩_in_2;
 double     轩_do_3;
 int        轩_in_4;
 double     轩_do_5;
 int        轩_in_6;
 bool       轩_bo_7;

 文_4_bo = false ;
 文_5_in=林_42_in_F0 + 1;
 do
 {
   文_3_bo = true ;
   文_4_bo = true ;
   for (文_6_in = 文_5_in ; 文_6_in >= 文_5_in - 林_42_in_F0 ; 文_6_in --)
   {
     if ( iHigh(林_330_st_2940,胜_0_in,文_6_in)>iHigh(林_330_st_2940,胜_0_in,文_5_in) )
     {
       文_4_bo = false ;
     }
   }
   for (文_7_in = 文_5_in ; 文_7_in <= 文_5_in + 林_41_in_EC ; 文_7_in ++)
   {
     if ( iHigh(林_330_st_2940,胜_0_in,文_7_in)>iHigh(林_330_st_2940,胜_0_in,文_5_in) )
     {
       文_3_bo = false ;
     }
   }
   if ( 文_4_bo && 文_3_bo && iHigh(林_330_st_2940,胜_0_in,文_5_in)>林_48_do_108 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) )
   {
     轩_do_1 = iHigh(林_330_st_2940,胜_0_in,文_5_in);
     轩_in_2 = 文_5_in;
     轩_do_3 = iHigh(林_330_st_2940,0,0);
     for (轩_in_4 = 1 ; 轩_in_4 <= 轩_in_2 ; 轩_in_4=轩_in_4 + 1)
     {
       if ( iHigh(林_330_st_2940,0,轩_in_4)>轩_do_3 )
       {
         轩_do_3 = iHigh(林_330_st_2940,0,轩_in_4);
       }
     }
     if ( 轩_do_1>=轩_do_3 )
     {
       轩_do_5 = NormalizeDouble(iHigh(林_330_st_2940,胜_0_in,文_5_in),林_147_in_3B0);
       轩_bo_7=false; 
       for (轩_in_6 = OrdersTotal() ; 轩_in_6 >= 0 ; 轩_in_6=轩_in_6 - 1)
       {
         if ( OrderSelect(轩_in_6,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 || !(MathAbs(OrderOpenPrice() - (林_52_do_120 * 林_201_do_1C98 + 轩_do_5))<林_56_do_140 * 林_201_do_1C98) )   continue;
         轩_bo_7 = true;
          break;
         
       }
       if ( !(轩_bo_7) && ( !(林_43_bo_F4) || !(iClose(林_330_st_2940,胜_0_in,文_5_in - 1)>iHigh(林_330_st_2940,胜_0_in,文_5_in) - 林_48_do_108 * 林_201_do_1C98) ) )
       {
         文_2_bo = true ;
         林_245_do_1D90 = NormalizeDouble(iHigh(林_330_st_2940,胜_0_in,文_5_in),林_147_in_3B0) ;
         林_248_in_1DA8 = 文_5_in ;
         break;
       }
     }
   }
   文_5_in ++;
   if ( 文_5_in <= 林_45_in_F8 )   continue;
   林_245_do_1D90 = 0.0 ;
   break;
   
 }
 while(!(文_2_bo));
 
 return(林_245_do_1D90); 
 }
//ccbsw_10 <<==--------   --------
 double ccbsw_11( int 胜_0_in)
 {
  bool      文_2_bo = false;
  bool      文_3_bo = false;
  bool      文_4_bo;
  int       文_5_in;
  int       文_6_in;
  int       文_7_in;
//----- -----
 double     轩_do_1;
 int        轩_in_2;
 double     轩_do_3;
 int        轩_in_4;
 double     轩_do_5;
 int        轩_in_6;
 bool       轩_bo_7;

 文_4_bo = false ;
 文_5_in=林_42_in_F0 + 1;
 do
 {
   文_3_bo = true ;
   文_4_bo = true ;
   for (文_6_in = 文_5_in ; 文_6_in >= 文_5_in - 林_42_in_F0 ; 文_6_in --)
   {
     if ( iLow(林_330_st_2940,胜_0_in,文_6_in)<iLow(林_330_st_2940,胜_0_in,文_5_in) )
     {
       文_4_bo = false ;
     }
   }
   for (文_7_in = 文_5_in ; 文_7_in <= 文_5_in + 林_41_in_EC ; 文_7_in ++)
   {
     if ( iLow(林_330_st_2940,胜_0_in,文_7_in)<iLow(林_330_st_2940,胜_0_in,文_5_in) )
     {
       文_3_bo = false ;
     }
   }
   if ( 文_4_bo && 文_3_bo && iLow(林_330_st_2940,胜_0_in,文_5_in)<MarketInfo(林_330_st_2940,MODE_BID) - 林_48_do_108 * 林_201_do_1C98 )
   {
     轩_do_1 = iLow(林_330_st_2940,胜_0_in,文_5_in);
     轩_in_2 = 文_5_in;
     轩_do_3 = iLow(林_330_st_2940,0,0);
     for (轩_in_4 = 1 ; 轩_in_4 <= 轩_in_2 ; 轩_in_4=轩_in_4 + 1)
     {
       if ( iLow(林_330_st_2940,0,轩_in_4)<轩_do_3 )
       {
         轩_do_3 = iLow(林_330_st_2940,0,轩_in_4);
       }
     }
     if ( 轩_do_1<=轩_do_3 )
     {
       轩_do_5 = NormalizeDouble(iLow(林_330_st_2940,胜_0_in,文_5_in),林_147_in_3B0);
       轩_bo_7=false; 
       for (轩_in_6 = OrdersTotal() ; 轩_in_6 >= 0 ; 轩_in_6=轩_in_6 - 1)
       {
         if ( OrderSelect(轩_in_6,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 || !(MathAbs(OrderOpenPrice() - (轩_do_5 - 林_53_do_128 * 林_201_do_1C98))<林_56_do_140 * 林_201_do_1C98) )   continue;
         轩_bo_7 = true;
          break;
         
       }
       if ( !(轩_bo_7) && ( !(林_43_bo_F4) || !(iClose(林_330_st_2940,胜_0_in,文_5_in - 1)<林_48_do_108 * 林_201_do_1C98 + iLow(林_330_st_2940,胜_0_in,文_5_in)) ) )
       {
         文_2_bo = true ;
         林_244_do_1D88 = NormalizeDouble(iLow(林_330_st_2940,胜_0_in,文_5_in),林_147_in_3B0) ;
         林_249_in_1DAC = 文_5_in ;
         break;
       }
     }
   }
   文_5_in ++;
   if ( 文_5_in <= 林_45_in_F8 )   continue;
   林_244_do_1D88 = 0.0 ;
   break;
   
 }
 while(!(文_2_bo));
 
 return(林_244_do_1D88); 
 }
//ccbsw_11 <<==--------   --------
 double ccbsw_12( int 胜_0_in,int 胜_1_in,int 胜_2_in)
 {
  bool      文_2_bo = false;
  double    文_3_do = 0.0;
  bool      文_4_bo = false;
  bool      文_5_bo;
  int       文_6_in;
  int       文_7_in;
  int       文_8_in;
//----- -----

 文_5_bo = false ;
 文_6_in=胜_2_in + 1;
 do
 {
   文_4_bo = true ;
   文_5_bo = true ;
   for (文_7_in = 文_6_in ; 文_7_in >= 文_6_in - 胜_2_in ; 文_7_in --)
   {
     if ( iHigh(林_330_st_2940,胜_0_in,文_7_in)>iHigh(林_330_st_2940,胜_0_in,文_6_in) )
     {
       文_5_bo = false ;
     }
   }
   for (文_8_in = 文_6_in ; 文_8_in <= 文_6_in + 胜_1_in ; 文_8_in ++)
   {
     if ( iHigh(林_330_st_2940,胜_0_in,文_8_in)>iHigh(林_330_st_2940,胜_0_in,文_6_in) )
     {
       文_4_bo = false ;
     }
   }
   if ( 文_5_bo && 文_4_bo && iHigh(林_330_st_2940,胜_0_in,文_6_in)>林_189_do_1918 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) )
   {
     文_2_bo = true ;
     文_3_do = NormalizeDouble(iHigh(林_330_st_2940,胜_0_in,文_6_in),林_147_in_3B0) ;
     break;
   }
   文_6_in ++;
   if ( 文_6_in <= 林_83_in_21C )   continue;
   文_3_do = 9999.0 ;
   break;
   
 }
 while(!(文_2_bo));
 
 return(文_3_do); 
 }
//ccbsw_12 <<==--------   --------
 double ccbsw_13( int 胜_0_in,int 胜_1_in,int 胜_2_in)
 {
  bool      文_2_bo = false;
  double    文_3_do = 0.0;
  bool      文_4_bo = false;
  bool      文_5_bo;
  int       文_6_in;
  int       文_7_in;
  int       文_8_in;
//----- -----

 文_5_bo = false ;
 文_6_in=胜_2_in + 1;
 do
 {
   文_4_bo = true ;
   文_5_bo = true ;
   for (文_7_in = 文_6_in ; 文_7_in >= 文_6_in - 胜_2_in ; 文_7_in --)
   {
     if ( iLow(林_330_st_2940,胜_0_in,文_7_in)<iLow(林_330_st_2940,胜_0_in,文_6_in) )
     {
       文_5_bo = false ;
     }
   }
   for (文_8_in = 文_6_in ; 文_8_in <= 文_6_in + 胜_1_in ; 文_8_in ++)
   {
     if ( iLow(林_330_st_2940,胜_0_in,文_8_in)<iLow(林_330_st_2940,胜_0_in,文_6_in) )
     {
       文_4_bo = false ;
     }
   }
   if ( 文_5_bo && 文_4_bo && iLow(林_330_st_2940,胜_0_in,文_6_in)<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 * 林_201_do_1C98 )
   {
     文_2_bo = true ;
     文_3_do = NormalizeDouble(iLow(林_330_st_2940,胜_0_in,文_6_in),林_147_in_3B0) ;
     break;
   }
   文_6_in ++;
   if ( 文_6_in <= 林_83_in_21C )   continue;
   文_3_do = 0.0 ;
   break;
   
 }
 while(!(文_2_bo));
 
 return(文_3_do); 
 }
//ccbsw_13 <<==--------   --------
 bool ccbsw_14( int 胜_0_in)
 {
  bool      文_2_bo;
  double    文_3_do;
  double    文_4_do;
  double    文_5_do;
  double    文_6_do;
//----- -----
 bool       轩_bo_1;
 int        轩_in_2;
 double     轩_do_3;
 int        轩_in_4;
 bool       轩_bo_5;
 int        轩_in_6;
 int        轩_in_7;
 double     轩_do_8;
 int        轩_in_9;
 bool       轩_bo_10;
 int        轩_in_11;
 bool       轩_bo_12;
 int        轩_in_13;
 double     轩_do_14;
 int        轩_in_15;
 int        轩_in_16;

 if ( 林_186_bo_190C )
 {
   轩_bo_1 = false;
 }
 else
 {
   轩_bo_1=false; 
   for (轩_in_2 = 0 ; 轩_in_2 < OrdersTotal() ; 轩_in_2=轩_in_2 + 1)
   {
     if ( OrderSelect(轩_in_2,0,0) != true || OrderType() != 0 || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
     轩_bo_1 = true;
      break;
     
   }
 }
 if ( 轩_bo_1 == true )
 {
   return(false); 
 }
 if ( 林_180_bo_15A8 && 林_251_do_1DB8<林_252_do_1DC0 )
 {
   return(false); 
 }
 if ( 胜_0_in == 1 )
 {
    ccbsw_10(林_39_in_E4);   
   文_2_bo = false ;
   轩_do_3 = 林_245_do_1D90;
   轩_bo_5=false; 
   for (轩_in_4 = OrdersTotal() ; 轩_in_4 >= 0 ; 轩_in_4=轩_in_4 - 1)
   {
     if ( OrderSelect(轩_in_4,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 || !(MathAbs(OrderOpenPrice() - (林_52_do_120 * 林_201_do_1C98 + 轩_do_3))<林_56_do_140 * 林_201_do_1C98) )   continue;
     轩_bo_5 = true;
      break;
     
   }
   if ( !(轩_bo_5) )
   {
     轩_in_6 = 0;
     for (轩_in_7 = OrdersTotal() ; 轩_in_7 >= 0 ; 轩_in_7=轩_in_7 - 1)
     {
       if ( OrderSelect(轩_in_7,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 )   continue;
       轩_in_6=轩_in_6 + 1;
       
     }
     if ( 轩_in_6 == 林_55_in_138 )
     {
       轩_do_8 = 9999.0;
       for (轩_in_9 = OrdersTotal() ; 轩_in_9 >= 0 ; 轩_in_9=轩_in_9 - 1)
       {
         if ( OrderSelect(轩_in_9,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 4 || !(OrderOpenPrice()<轩_do_8) )   continue;
         轩_do_8 = OrderOpenPrice();
         
       }
       if ( 林_245_do_1D90>轩_do_8 )
       {
         return(false); 
       }
     }
     林_247_do_1DA0 = 林_245_do_1D90 ;
     文_2_bo = true ;
     林_145_do_3A0 = NormalizeDouble(林_245_do_1D90,林_147_in_3B0) ;
   }
   if ( 林_145_do_3A0==0.0 )
   {
     return(false); 
   }
   if ( 文_2_bo )
   {
     林_228_do_1D10 = 林_93_do_268 ;
     文_3_do = NormalizeDouble(林_52_do_120 * 林_201_do_1C98 + 林_145_do_3A0,林_147_in_3B0) ;
     林_303_do_20B0 = 文_3_do ;
     if ( !(林_34_bo_C8) )
     {
       if ( 林_36_bo_D0 && AccountFreeMarginCheck(林_330_st_2940,0,林_192_do_195C_si99[林_321_in_2910])<=0.0 )
       {
         Print("Free margin not sufficient for setting order with lotsize " + string(林_192_do_195C_si99[林_321_in_2910]) + "..."); 
         return(false); 
       }
       文_4_do = NormalizeDouble(林_7_in_18 * 林_201_do_1C98 + 文_3_do,林_147_in_3B0) ;
       文_5_do = NormalizeDouble(文_3_do - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98,林_147_in_3B0) ;
       文_6_do = NormalizeDouble(林_70_do_1A8 * 林_201_do_1C98 + 文_3_do,林_147_in_3B0) ;
       if ( 林_192_do_195C_si99[林_321_in_2910]<SymbolInfoDouble(林_330_st_2940,34) )
       {
         Print("Volume is less than the minimal allowed SYMBOL_VOLUME_MIN=" + string(SymbolInfoDouble(林_330_st_2940,34))); 
         轩_bo_10 = false;
       }
       else
       {
         if ( 林_192_do_195C_si99[林_321_in_2910]>SymbolInfoDouble(林_330_st_2940,35) )
         {
           Print("Volume is greater than the maximal allowed SYMBOL_VOLUME_MAX=" + string(SymbolInfoDouble(林_330_st_2940,35))); 
           轩_bo_10 = false;
         }
         else
         {
           if ( MathAbs((int(MathRound(林_192_do_195C_si99[林_321_in_2910] / SymbolInfoDouble(林_330_st_2940,36)))) * SymbolInfoDouble(林_330_st_2940,36) - 林_192_do_195C_si99[林_321_in_2910])>0.0000001 )
           {
             Print("Volume is not a multiple of the minimal step SYMBOL_VOLUME_STEP=" + string(SymbolInfoDouble(林_330_st_2940,36))); 
             轩_bo_10 = false;
           }
           else
           {
             轩_bo_10 = true;
           }
         }
       }

       轩_in_11 = AccountInfoInteger(ACCOUNT_LIMIT_ORDERS);
       if ( 轩_in_11 == 0 )
       {
         轩_bo_12 = true;
       }
       else
       {
         轩_bo_12 = OrdersTotal()<轩_in_11;
       }
       if ( ( !(轩_bo_10) || !(轩_bo_12) ) )
       {
         return(false); 
       }
       if ( MarketInfo(林_330_st_2940,MODE_ASK)<文_4_do - 林_302_do_20A8 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)<文_4_do - 林_189_do_1918 * 林_201_do_1C98 )
       {
         if ( !(setSL_TP_After_Entry) )
         {
           林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),文_5_do,文_6_do,林_328_st_2930,林_62_in_160,林_294_da_2080,Green) ;
         }
         else
         {
           林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),0.0,0.0,林_328_st_2930,林_62_in_160,林_294_da_2080,Green) ;
         }
         林_266_bo_1E0A = false ;
         if ( 林_202_in_1CA0 <= 0 )
         {
           轩_in_13 = GetLastError();
           if ( 轩_in_13 == 132 )
           {
             ResetLastError();
             if(1==0) //条件不成立
             {
               do
               {
                 Sleep(2500); 
                 if ( !(setSL_TP_After_Entry) )
                 {
                   轩_in_13 = 林_15_do_50 * 林_201_do_1C98;
                   林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_192_do_195C_si99[林_321_in_2910],文_4_do,轩_in_13,文_5_do,文_6_do,林_328_st_2930,林_62_in_160,林_294_da_2080,Green) ;
                 }
                 else
                 {
                   林_202_in_1CA0 = OrderSend(林_330_st_2940,4,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),0.0,0.0,林_328_st_2930,林_62_in_160,林_294_da_2080,Green) ;
                 }
                 林_266_bo_1E0A = false ;
               }
               while(GetLastError() == 132);
               
             }
           }
           Print("error: \'" + ccbsw_19(GetLastError()) + "\' when setting entry order"); 
         }
         else
         {
           轩_do_14 = 文_3_do;
           轩_in_15 = 林_202_in_1CA0;
           for (轩_in_16 = 0 ; 轩_in_16 < 100 ; 轩_in_16=轩_in_16 + 1)
           {
             if ( !(林_155_do_F08_si100si2[轩_in_16][0]==0.0) )   continue;
             林_155_do_F08_si100si2[轩_in_16][0] = 轩_in_15;
             林_155_do_F08_si100si2[轩_in_16][1] = 轩_do_14;
             break;
             
           }
         }
       }
     }
     return(true); 
   }
 }
 return(false); 
 }
//ccbsw_14 <<==--------   --------
 bool ccbsw_15( int 胜_0_in)
 {
  bool      文_2_bo;
  double    文_3_do;
  double    文_4_do;
  double    文_5_do;
  double    文_6_do;
//----- -----
 bool       轩_bo_1;
 int        轩_in_2;
 double     轩_do_3;
 int        轩_in_4;
 bool       轩_bo_5;
 int        轩_in_6;
 int        轩_in_7;
 double     轩_do_8;
 int        轩_in_9;
 bool       轩_bo_10;
 int        轩_in_11;
 bool       轩_bo_12;
 int        轩_in_13;
 double     轩_do_14;
 int        轩_in_15;
 int        轩_in_16;

 if ( 林_186_bo_190C )
 {
   轩_bo_1 = false;
 }
 else
 {
   轩_bo_1=false; 
   for (轩_in_2 = 0 ; 轩_in_2 < OrdersTotal() ; 轩_in_2=轩_in_2 + 1)
   {
     if ( OrderSelect(轩_in_2,0,0) != true || OrderType() != 1 || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
     轩_bo_1 = true;
      break;
     
   }
 }
 if ( 轩_bo_1 == true )
 {
   return(false); 
 }
 if ( 林_180_bo_15A8 && 林_251_do_1DB8>林_252_do_1DC0 )
 {
   return(false); 
 }
 if ( 胜_0_in == 1 )
 {
   ccbsw_11(林_39_in_E4);
   文_2_bo = false ;
   轩_do_3 = 林_244_do_1D88;
   轩_bo_5=false; 
   for (轩_in_4 = OrdersTotal() ; 轩_in_4 >= 0 ; 轩_in_4=轩_in_4 - 1)
   {
     if ( OrderSelect(轩_in_4,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 || !(MathAbs(OrderOpenPrice() - (轩_do_3 - 林_53_do_128 * 林_201_do_1C98))<林_56_do_140 * 林_201_do_1C98) )   continue;
     轩_bo_5 = true;
      break;
     
   }
   if ( !(轩_bo_5) )
   {
     轩_in_6 = 0;
     for (轩_in_7 = OrdersTotal() ; 轩_in_7 >= 0 ; 轩_in_7=轩_in_7 - 1)
     {
       if ( OrderSelect(轩_in_7,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 )   continue;
       轩_in_6=轩_in_6 + 1;
       
     }
     if ( 轩_in_6 == 林_55_in_138 )
     {
       轩_do_8 = 0.0;
       for (轩_in_9 = OrdersTotal() ; 轩_in_9 >= 0 ; 轩_in_9=轩_in_9 - 1)
       {
         if ( OrderSelect(轩_in_9,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 || OrderType() != 5 || !(OrderOpenPrice()>轩_do_8) )   continue;
         轩_do_8 = OrderOpenPrice();
         
       }
       if ( 林_244_do_1D88<轩_do_8 )
       {
         return(false); 
       }
     }
     林_246_do_1D98 = 林_244_do_1D88 ;
     文_2_bo = true ;
     林_146_do_3A8 = NormalizeDouble(林_244_do_1D88,林_147_in_3B0) ;
   }
   if ( 林_146_do_3A8==0.0 )
   {
     return(false); 
   }
   if ( 文_2_bo )
   {
     林_228_do_1D10 = 林_93_do_268 ;
     文_3_do = NormalizeDouble(林_146_do_3A8 - 林_53_do_128 * 林_201_do_1C98,林_147_in_3B0) ;
     林_304_do_20B8 = 文_3_do ;
     if ( !(林_34_bo_C8) )
     {
       if ( 林_36_bo_D0 && AccountFreeMarginCheck(林_330_st_2940,1,林_192_do_195C_si99[林_321_in_2910])<=0.0 )
       {
         Print("Free margin not sufficient for setting order with lotsize " + string(林_192_do_195C_si99[林_321_in_2910]) + "..."); 
         return(false); 
       }
       文_4_do = NormalizeDouble(文_3_do - 林_7_in_18 * 林_201_do_1C98,林_147_in_3B0) ;
       文_5_do = NormalizeDouble((林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 文_3_do,林_147_in_3B0) ;
       文_6_do = NormalizeDouble(文_3_do - 林_70_do_1A8 * 林_201_do_1C98,林_147_in_3B0) ;
       if ( 林_192_do_195C_si99[林_321_in_2910]<SymbolInfoDouble(林_330_st_2940,34) )
       {
         Print("Volume is less than the minimal allowed SYMBOL_VOLUME_MIN=" + string(SymbolInfoDouble(林_330_st_2940,34))); 
         轩_bo_10 = false;
       }
       else
       {
         if ( 林_192_do_195C_si99[林_321_in_2910]>SymbolInfoDouble(林_330_st_2940,35) )
         {
           Print("Volume is greater than the maximal allowed SYMBOL_VOLUME_MAX=" + string(SymbolInfoDouble(林_330_st_2940,35))); 
           轩_bo_10 = false;
         }
         else
         {
           if ( MathAbs((int(MathRound(林_192_do_195C_si99[林_321_in_2910] / SymbolInfoDouble(林_330_st_2940,36)))) * SymbolInfoDouble(林_330_st_2940,36) - 林_192_do_195C_si99[林_321_in_2910])>0.0000001 )
           {
             Print("Volume is not a multiple of the minimal step SYMBOL_VOLUME_STEP=" + string(SymbolInfoDouble(林_330_st_2940,36))); 
             轩_bo_10 = false;
           }
           else
           {
             轩_bo_10 = true;
           }
         }
       }

       轩_in_11 = AccountInfoInteger(ACCOUNT_LIMIT_ORDERS);
       if ( 轩_in_11 == 0 )
       {
         轩_bo_12 = true;
       }
       else
       {
         轩_bo_12 = OrdersTotal()<轩_in_11;
       }
       if ( ( !(轩_bo_10) || !(轩_bo_12) ) )
       {
         return(false); 
       }
       if ( MarketInfo(林_330_st_2940,MODE_BID)>林_302_do_20A8 * 林_201_do_1C98 + 文_4_do && MarketInfo(林_330_st_2940,MODE_BID)>林_189_do_1918 * 林_201_do_1C98 + 文_4_do )
       {
         if ( !(setSL_TP_After_Entry) )
         {
           林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),文_5_do,文_6_do,林_328_st_2930,林_62_in_160,林_294_da_2080,Red) ;
         }
         else
         {
           林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),0.0,0.0,林_328_st_2930,林_62_in_160,林_294_da_2080,Red) ;
         }
         林_267_bo_1E0B = false ;
         if ( 林_202_in_1CA0 <= 0 )
         {
           轩_in_13 = GetLastError();
           if ( 轩_in_13 == 132 )
           {
             ResetLastError();
             if(1==0) //条件不成立
             {
               do
               {
                 Sleep(2500); 
                 if ( !(setSL_TP_After_Entry) )
                 {
                   轩_in_13 = 林_15_do_50 * 林_201_do_1C98;
                   林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_192_do_195C_si99[林_321_in_2910],文_4_do,轩_in_13,文_5_do,文_6_do,林_328_st_2930,林_62_in_160,林_294_da_2080,Red) ;
                 }
                 else
                 {
                   林_202_in_1CA0 = OrderSend(林_330_st_2940,5,林_192_do_195C_si99[林_321_in_2910],文_4_do,int(林_15_do_50 * 林_201_do_1C98),0.0,0.0,林_328_st_2930,林_62_in_160,林_294_da_2080,Red) ;
                 }
                 林_267_bo_1E0B = false ;
               }
               while(GetLastError() == 132);
               
             }
           }
           Print("error: \'" + ccbsw_19(GetLastError()) + "\' when setting entry order"); 
         }
         else
         {
           轩_do_14 = 文_3_do;
           轩_in_15 = 林_202_in_1CA0;
           for (轩_in_16 = 0 ; 轩_in_16 < 100 ; 轩_in_16=轩_in_16 + 1)
           {
             if ( !(林_155_do_F08_si100si2[轩_in_16][0]==0.0) )   continue;
             林_155_do_F08_si100si2[轩_in_16][0] = 轩_in_15;
             林_155_do_F08_si100si2[轩_in_16][1] = 轩_do_14;
             break;
             
           }
         }
       }
     }
   }
 }
 return(false); 
 }
//ccbsw_15 <<==--------   --------
 bool ccbsw_16()
 {
  bool      文_2_bo = false;
  bool      文_3_bo = false;
  double    文_4_do;
  double    文_5_do;
  int       文_6_in;
  double    文_7_do;
  double    文_8_do;
  double    文_9_do;
  double    文_10_do;
  string    文_11_st;
  double    文_12_do;
  datetime  文_13_da;
  int       文_14_in;
  int       文_15_in;
  string    文_16_st;
  double    文_17_do;
  double    文_18_do;
  bool      文_19_bo;
  bool      文_20_bo;
  double    文_21_do;
  bool      文_22_bo;
  double    文_23_do;
  double    文_24_do;
  double    文_25_do;
  double    文_26_do;
  int       文_27_in;
  double    文_28_do;
//----- -----
 int        轩_in_1;
 int        轩_in_2;
 int        轩_in_3;
 double     轩_do_4;
 double     轩_do_5;
 int        轩_in_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;
 string     轩_st_11;
 double     轩_do_12;
 int        轩_in_13;
 int        轩_in_14;
 double     轩_do_15;
 int        轩_in_16;
 int        轩_in_17;
 int        轩_in_18;
 int        轩_in_19;
 int        轩_in_20;
 string     轩_st_21;
 int        轩_in_22;
 double     轩_do_23;
 double     轩_do_24;
 int        轩_in_25;
 double     轩_do_26;
 bool       轩_bo_27;
 int        轩_in_28;
 int        轩_in_29;
 double     轩_do_30;
 int        轩_in_31;
 int        轩_in_32;
 int        轩_in_33;
 double     轩_do_34;
 double     轩_do_35;
 int        轩_in_36;
 double     轩_do_37;
 bool       轩_bo_38;
 int        轩_in_39;
 int        轩_in_40;
 double     轩_do_41;
 int        轩_in_42;
 int        轩_in_43;

 文_4_do = 0.0 ;
 文_5_do = 0.0 ;
 for (文_6_in = 0 ; 文_6_in < OrdersTotal() ; 文_6_in ++)
 {
   if ( OrderSelect(文_6_in,0,0) == true )
   {
     文_2_bo = false ;
     文_7_do = NormalizeDouble(OrderStopLoss(),林_147_in_3B0) ;
     文_8_do = NormalizeDouble(OrderTakeProfit(),林_147_in_3B0) ;
     文_9_do = OrderTicket() ;
     文_10_do = NormalizeDouble(OrderOpenPrice(),林_147_in_3B0) ;
     文_11_st = OrderComment() ;
     文_12_do = OrderLots() ;
     文_13_da = OrderOpenTime() ;
     文_14_in = OrderType() ;
     文_15_in = OrderMagicNumber() ;
     文_16_st = OrderSymbol() ;
     if ( ( 文_14_in == 4 || 文_14_in == 2 ) && 林_37_in_D4 == 2 && ( 林_64_in_174 == 0 || (林_64_in_174 == 1 && 文_16_st == 林_330_st_2940) ) && ( 文_15_in == 林_65_in_178 || 林_65_in_178 == 0 ) && ( 文_11_st == 林_66_st_180 || 林_66_st_180 == "" ) )
     {
       if ( ( 文_7_do==0.0 || 文_7_do==0.0 ) )
       {
         文_7_do = NormalizeDouble(文_10_do - 林_69_do_1A0 * 林_201_do_1C98,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       if ( ( 文_8_do==0.0 || 文_8_do==0.0 ) )
       {
         文_8_do = NormalizeDouble(林_70_do_1A8 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
     }
     if ( 文_14_in == 0 && ( ( 文_15_in == 林_62_in_160 && 林_37_in_D4 == 1 && 文_16_st == 林_330_st_2940 ) || (林_37_in_D4 == 2 && ( 林_64_in_174 == 0 || (林_64_in_174 == 1 && 文_16_st == 林_330_st_2940) ) && ( 文_15_in == 林_65_in_178 || 林_65_in_178 == 0 ) && (文_11_st == 林_66_st_180 || 林_66_st_180 == "")) ) )
     {
       if ( ( 文_7_do==0.0 || 文_7_do==0.0 ) )
       {
         文_7_do = NormalizeDouble(文_10_do - 林_69_do_1A0 * 林_201_do_1C98,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       if ( ( 文_8_do==0.0 || 文_8_do==0.0 ) )
       {
         文_8_do = NormalizeDouble(林_70_do_1A8 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       林_228_do_1D10 = 林_93_do_268 ;
       if ( 林_97_in_288 >  0 && TimeCurrent() >  文_13_da + 林_97_in_288 * 60 )
       {
         林_228_do_1D10 = 林_98_do_290 ;
       }
       轩_in_1 = 林_147_in_3B0;
       轩_in_2 = 文_9_do;
       for (轩_in_3 = 0 ; 轩_in_3 < 100 ; 轩_in_3=轩_in_3 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_3][0]==轩_in_2) )   continue;
         轩_do_4 = 林_155_do_F08_si100si2[轩_in_3][1];
         break;
         
       }
       轩_do_4 = 0.0;
       文_17_do = NormalizeDouble(轩_do_4,轩_in_1) ;
       if ( 文_17_do==0.0 )
       {
         轩_do_5 = 文_10_do;
         轩_in_6 = 文_9_do;
         for (轩_in_7 = 0 ; 轩_in_7 < 100 ; 轩_in_7=轩_in_7 + 1)
         {
           if ( !(林_155_do_F08_si100si2[轩_in_7][0]==0.0) )   continue;
           林_155_do_F08_si100si2[轩_in_7][0] = 轩_in_6;
           林_155_do_F08_si100si2[轩_in_7][1] = 轩_do_5;
           break;
           
         }
         文_17_do = 文_10_do ;
       }
       else
       {
         文_17_do = 文_17_do - 林_54_do_130 * 林_201_do_1C98 ;
       }
       文_18_do = 文_10_do - 文_17_do ;
       文_19_bo = false ;
       if ( 文_17_do>0.0 - 林_54_do_130 * 林_201_do_1C98 && 文_18_do>林_15_do_50 * 林_201_do_1C98 )
       {
         文_19_bo = true ;
         if ( 林_16_in_58 == 2 )
         {
           林_228_do_1D10 = -1000.0 ;
           Print("SlippageMode 2 active"); 
         }
       }
       if ( 林_20_bo_78 )
       {
         文_5_do = 文_17_do ;
       }
       else
       {
         文_5_do = 文_10_do ;
       }
       if ( 文_7_do<NormalizeDouble(文_10_do - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 - 林_1_do_0,林_147_in_3B0) )
       {
         文_7_do = NormalizeDouble(文_10_do - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 - 林_1_do_0,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF); 
       }
       if ( MarketInfo(林_330_st_2940,MODE_BID)<文_10_do - (林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 - 林_1_do_0 )
       {
         RefreshRates(); 
         OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_1_do_0,Red); 
         return(true); 
       }
       文_20_bo = false ;
       if ( 林_115_bo_2FC )
       {
         轩_in_8 = 文_9_do;
         轩_in_9 = 0;
         for (轩_in_10 = OrdersTotal() ; 轩_in_10 >= 0 ; 轩_in_10=轩_in_10 - 1)
         {
           if ( OrderSelect(轩_in_10,0,0) != true || OrderMagicNumber() != 林_125_in_340 || OrderSymbol() != 林_330_st_2940 )   continue;
           轩_st_11 = OrderComment();
           if ( 轩_st_11 != IntegerToString(轩_in_8,0,32) )   continue;
           轩_in_9=轩_in_9 + 1;
           
         }
         文_21_do = 轩_in_9 ;
         文_22_bo = false ;
         if ( !(林_151_bo_3C8) )
         {
           林_151_bo_3C8 = true ;
           林_149_in_3C0 = 0 ;
         }
         if ( 文_21_do==0.0 )
         {
           林_149_in_3C0 = 0 ;
         }
         if ( MathFloor(文_21_do / 2.0)==文_21_do / 2.0 )
         {
           林_149_in_3C0 = 0 ;
         }
         else
         {
           林_149_in_3C0 = 1 ;
         }
         if ( 林_151_bo_3C8 )
         {
           if ( 文_21_do>0.0 )
           {
             轩_do_12 = AccountEquity();
             if ( 轩_do_12>AccountBalance() + 林_119_do_318 )
             {
               for (轩_in_13 = OrdersTotal() ; 轩_in_13 >= 0 ; 轩_in_13=轩_in_13 - 1)
               {
                 if ( OrderSelect(轩_in_13,0,0) != true )   continue;
                 
                 if ( ( OrderMagicNumber() != 林_62_in_160 && OrderMagicNumber() != 林_126_in_344 && OrderMagicNumber() != 林_125_in_340 ) )   continue;
                 
                 if ( OrderType() == 0 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                 }
                 if ( OrderType() != 1 )   continue;
                 OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                 
               }
             }
           }
           if ( 文_21_do>0.0 )
           {
             轩_in_14 = 文_9_do;
             轩_do_15 = 0.0;
             for (轩_in_16 = OrdersTotal() ; 轩_in_16 >= 0 ; 轩_in_16=轩_in_16 - 1)
             {
               if ( OrderSelect(轩_in_16,0,0) != true )   continue;
               
               if ( OrderTicket() != 轩_in_14 )
               {
                 轩_st_11 = OrderComment();
               if ( 轩_st_11 != IntegerToString(轩_in_14,0,32) )   continue;
               }
               轩_do_15 = 轩_do_15 + OrderProfit();
               
             }
             if ( 轩_do_15>林_119_do_318 )
             {
               Print("Closing zone"); 
               轩_in_17 = 文_9_do;
               for (轩_in_18 = OrdersTotal() ; 轩_in_18 >= 0 ; 轩_in_18=轩_in_18 - 1)
               {
                 if ( OrderSelect(轩_in_18,0,0) != true )   continue;
                 
                 if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 轩_in_17 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),3,Red); 
                 }
                 if ( OrderMagicNumber() != 林_125_in_340 )   continue;
                 轩_st_11 = OrderComment();
                 if ( 轩_st_11 != IntegerToString(轩_in_17,0,32) )   continue;
                 
                 if ( OrderType() == 0 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                 }
                 if ( OrderType() != 1 )   continue;
                 OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                 
               }
               林_151_bo_3C8 = false ;
               文_20_bo = true ;
             }
           }
           else
           {
             文_23_do = 文_12_do * 林_121_do_328 ;
             if ( 林_120_in_320 == 2 )
             {
               文_23_do = (文_21_do + 1.0) * 文_12_do + 文_12_do ;
             }
             if ( 林_120_in_320 == 3 )
             {
               文_23_do = 文_12_do * (MathPow(林_121_do_328,文_21_do + 1.0)) ;
             }
             if ( 林_149_in_3C0 == 0 )
             {
               文_24_do = 文_21_do * 林_117_do_308 * 林_201_do_1C98 + (文_17_do - 林_116_do_300 * 林_201_do_1C98) ;
               if ( 文_24_do>文_17_do - 林_118_do_310 * 林_201_do_1C98 )
               {
                 文_24_do = 文_17_do - 林_118_do_310 * 林_201_do_1C98 ;
               }
               if ( MarketInfo(林_330_st_2940,MODE_BID)<文_24_do )
               {
                 if ( 文_21_do>=林_122_in_330 )
                 {
                   for (轩_in_19 = OrdersTotal() ; 轩_in_19 >= 0 ; 轩_in_19=轩_in_19 - 1)
                   {
                     if ( OrderSelect(轩_in_19,0,0) != true )   continue;
                     
                     if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 文_9_do )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),3,Red); 
                     }
                     if ( OrderMagicNumber() != 林_125_in_340 )   continue;
                     轩_st_11 = OrderComment();
                     if ( 轩_st_11 != IntegerToString(文_9_do,0,32) )   continue;
                     
                     if ( OrderType() == 0 )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                     }
                     if ( OrderType() != 1 )   continue;
                     OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                     
                   }
                 }
                 else
                 {
                   OrderSend(林_330_st_2940,1,文_23_do,MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,0.0,0.0,IntegerToString(文_9_do,0,32),林_125_in_340,0,Green); 
                   林_149_in_3C0 = 1 ;
                   文_22_bo = true ;
                 }
               }
             }
             else
             {
               文_25_do = 文_17_do ;
               if ( MarketInfo(林_330_st_2940,MODE_ASK)>文_17_do )
               {
                 if ( 文_21_do>=林_122_in_330 )
                 {
                   for (轩_in_20 = OrdersTotal() ; 轩_in_20 >= 0 ; 轩_in_20=轩_in_20 - 1)
                   {
                     if ( OrderSelect(轩_in_20,0,0) != true )   continue;
                     
                     if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 文_9_do )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),3,Red); 
                     }
                     if ( OrderMagicNumber() != 林_125_in_340 )   continue;
                     轩_st_21 = OrderComment();
                     if ( 轩_st_21 != IntegerToString(文_9_do,0,32) )   continue;
                     
                     if ( OrderType() == 0 )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                     }
                     if ( OrderType() != 1 )   continue;
                     OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                     
                   }
                 }
                 else
                 {
                   OrderSend(林_330_st_2940,0,文_23_do,MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,0.0,0.0,IntegerToString(文_9_do,0,32),林_125_in_340,0,Green); 
                   林_149_in_3C0 = 0 ;
                   文_22_bo = true ;
                 }
               }
             }
           }
         }
         if ( ( 文_21_do>0.0 || 文_22_bo ) )
         {
           文_20_bo = true ;
         }
       }
       if ( !(文_20_bo) )
       {
         if ( ( 林_30_in_B0 == 1 || (林_30_in_B0 != 3 && 林_30_in_B0 != 2) ) )
         {
           轩_in_22 = 文_9_do;
           轩_do_23 = 林_69_do_1A0;
           轩_do_24 = 文_10_do;
           轩_in_25 = 1;
           轩_do_26 = 0.0;
           轩_bo_27 = false;
           for (轩_in_28 = 0 ; 轩_in_28 < 林_156_in_1548 ; 轩_in_28=轩_in_28 + 1)
           {
             if ( 林_153_do_400_si20si2[轩_in_28][0]==轩_in_22 )
             {
               轩_do_26 = 林_153_do_400_si20si2[轩_in_28][1];
               轩_bo_27 = true;
               break;
             }
           }
           if ( !(轩_bo_27) )
           {
             if ( 轩_in_25 == 1 )
             {
               轩_do_26 = NormalizeDouble(轩_do_24 - 轩_do_23 * 林_201_do_1C98,林_147_in_3B0);
             }
             if ( 轩_in_25 == 2 )
             {
               轩_do_26 = NormalizeDouble(轩_do_23 * 林_201_do_1C98 + 轩_do_24,林_147_in_3B0);
             }
             for (轩_in_29 = 0 ; 轩_in_29 < 林_156_in_1548 ; 轩_in_29=轩_in_29 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_29][0]==0.0 )
               {
                 林_153_do_400_si20si2[轩_in_29][0] = 轩_in_22;
                 林_153_do_400_si20si2[轩_in_29][1] = 轩_do_26;
                 break;
               }
             }
           }
           林_148_do_3B8 = 轩_do_26 ;
           文_4_do = 林_148_do_3B8 ;
           if ( MarketInfo(林_330_st_2940,MODE_BID)<文_4_do )
           {
             Print("Closing with virtual SL"); 
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_BID),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( 林_89_do_248>0.0 && TimeCurrent() >= 文_13_da + 林_296_in_208C && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_90_do_250 * 林_201_do_1C98 + (文_7_do + 林_331_do_2950),林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_BID) - 林_90_do_250 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting trailing Exit_TrailSL_after_X_Minutes_size loss.  Trying again!"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_72_do_1C0>0.0 && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble((林_72_do_1C0 + 林_75_do_1D8) * 林_201_do_1C98 + (文_7_do + 林_331_do_2950),林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_73_do_1C8 * 林_201_do_1C98 + 文_5_do,林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && 文_7_do<NormalizeDouble(林_74_do_1D0 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_BID) - 林_72_do_1C0 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting trailing Exit_stop loss.  Trying again!"); 
               }
               else
               {
                 文_26_do = NormalizeDouble(林_76_do_1E0 / 100.0 * 林_192_do_195C_si99[林_321_in_2910],2) ;
                 if ( 文_26_do<文_12_do && 文_26_do>=MarketInfo(林_330_st_2940,MODE_LOTSTEP) )
                 {
                   OrderClose(文_9_do,文_26_do,MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                   return(true); 
                 }
               }
               文_2_bo = true ;
             }
           }
           if ( 文_19_bo && 林_16_in_58 == 1 && 林_18_do_68>0.0 && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_18_do_68 * 林_201_do_1C98 + (文_7_do + 林_331_do_2950),林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_17_do_60 * 林_201_do_1C98 + 文_17_do,林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && 文_7_do<NormalizeDouble(林_19_do_70 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_BID) - 林_18_do_68 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting Slip TL.  Trying again!"); 
               }
               else
               {
                 Print("Slippage control active"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_84_in_220 >  0 && 林_85_in_224 >= 0 && 林_219_do_1CE8>NormalizeDouble(文_7_do + 林_189_do_1918 + 林_331_do_2950,林_147_in_3B0) && ( 林_219_do_1CE8<文_10_do || !(林_81_bo_214) ) && 林_219_do_1CE8<NormalizeDouble(MarketInfo(林_330_st_2940,MODE_BID) - 林_86_in_228 * 林_201_do_1C98 - 林_189_do_1918 - 林_331_do_2950,林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             文_7_do = NormalizeDouble(林_219_do_1CE8,林_147_in_3B0) ;
             if ( 文_7_do<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("error: \'" + ccbsw_19(GetLastError()) + "\' when modifying stoploss"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_78_do_1F8>0.0 && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_78_do_1F8 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) && NormalizeDouble(林_79_do_200 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0)>文_7_do + 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_BID)>NormalizeDouble(林_79_do_200 * 林_201_do_1C98 + 文_10_do + 林_189_do_1918,林_147_in_3B0) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             文_7_do = NormalizeDouble(林_79_do_200 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
             if ( 文_7_do<MarketInfo(林_330_st_2940,MODE_BID) - 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("error when setting breakeven: \'" + ccbsw_19(GetLastError()) + "\' ..\'Exit_BE_start\' to close to \'Exit_BE_extra_pips\' ..trying again!"); 
               }
               文_2_bo = true ;
             }
           }
           if ( !(文_2_bo) && ( 林_92_in_264 == 1 || (林_92_in_264 == 2 && 林_95_do_278 * 林_201_do_1C98 + 文_7_do<=林_96_do_280 * 林_201_do_1C98 + (文_5_do + 林_1_do_0)) ) )
           {
             林_233_in_1D28 ++;
             if ( MarketInfo(林_330_st_2940,MODE_BID)>林_95_do_278 * 林_201_do_1C98 + 文_7_do + 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && ( 林_93_do_268==0.0 || MarketInfo(林_330_st_2940,MODE_BID)>林_228_do_1D10 * 林_201_do_1C98 + 文_5_do ) && 林_233_in_1D28 >= 林_94_in_270 && NormalizeDouble(林_95_do_278 * 林_201_do_1C98 + 文_7_do,林_147_in_3B0)>文_7_do )
             {
               林_233_in_1D28 = 0 ;
               文_7_do = NormalizeDouble(林_95_do_278 * 林_201_do_1C98 + 文_7_do,林_147_in_3B0) ;
               OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF); 
               文_2_bo = true ;
             }
           }
           林_148_do_3B8 = 文_7_do ;
           if ( MarketInfo(林_330_st_2940,MODE_BID)<文_7_do )
           {
             Print("Closing with virtual SL"); 
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_BID),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( NormalizeDouble(文_4_do,林_147_in_3B0)!=NormalizeDouble(林_148_do_3B8,林_147_in_3B0) )
           {
             轩_do_30 = NormalizeDouble(林_148_do_3B8,林_147_in_3B0);
             轩_in_31 = 文_9_do;
             for (轩_in_32 = 0 ; 轩_in_32 < 林_156_in_1548 ; 轩_in_32=轩_in_32 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_32][0]==轩_in_31 )
               {
                 林_153_do_400_si20si2[轩_in_32][1] = 轩_do_30;
                 break;
               }
             }
           }
           if ( 文_2_bo && 林_99_bo_298 )
           {
             return(true); 
           }
         }
         if ( ( 林_30_in_B0 == 2 || 林_30_in_B0 == 3 ) )
         {
           轩_in_33 = 文_9_do;
           轩_do_34 = 林_69_do_1A0;
           轩_do_35 = 文_10_do;
           轩_in_36 = 1;
           轩_do_37 = 0.0;
           轩_bo_38 = false;
           for (轩_in_39 = 0 ; 轩_in_39 < 林_156_in_1548 ; 轩_in_39=轩_in_39 + 1)
           {
             if ( 林_153_do_400_si20si2[轩_in_39][0]==轩_in_33 )
             {
               轩_do_37 = 林_153_do_400_si20si2[轩_in_39][1];
               轩_bo_38 = true;
               break;
             }
           }
           if ( !(轩_bo_38) )
           {
             if ( 轩_in_36 == 1 )
             {
               轩_do_37 = NormalizeDouble(轩_do_35 - 轩_do_34 * 林_201_do_1C98,林_147_in_3B0);
             }
             if ( 轩_in_36 == 2 )
             {
               轩_do_37 = NormalizeDouble(轩_do_34 * 林_201_do_1C98 + 轩_do_35,林_147_in_3B0);
             }
             for (轩_in_40 = 0 ; 轩_in_40 < 林_156_in_1548 ; 轩_in_40=轩_in_40 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_40][0]==0.0 )
               {
                 林_153_do_400_si20si2[轩_in_40][0] = 轩_in_33;
                 林_153_do_400_si20si2[轩_in_40][1] = 轩_do_37;
                 break;
               }
             }
           }
           林_148_do_3B8 = 轩_do_37 ;
           文_4_do = 林_148_do_3B8 ;
           if ( MarketInfo(林_330_st_2940,MODE_BID)<=文_4_do )
           {
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_BID),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           文_27_in = TimeCurrent() - 林_312_da_20F0 ;
           if ( 文_27_in >= 林_32_in_C0 )
           {
             if ( NormalizeDouble(林_148_do_3B8,林_147_in_3B0)>文_7_do + 林_331_do_2950 )
             {
               OrderModify(文_9_do,文_10_do,NormalizeDouble(林_148_do_3B8,林_147_in_3B0),文_8_do,0,0xFFFFFFFF); 
             }
             林_312_da_20F0 = TimeCurrent() ;
           }
           if ( 林_89_do_248>0.0 && TimeCurrent() >= 文_13_da + 林_296_in_208C && MarketInfo(林_330_st_2940,MODE_BID)>林_90_do_250 * 林_201_do_1C98 + (林_148_do_3B8 + 林_331_do_2950) && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             文_2_bo = true ;
             林_148_do_3B8 = MarketInfo(林_330_st_2940,MODE_BID) - 林_90_do_250 * 林_201_do_1C98 ;
           }
           if ( 林_72_do_1C0>0.0 && MarketInfo(林_330_st_2940,MODE_BID)>(林_72_do_1C0 + 林_75_do_1D8) * 林_201_do_1C98 + (林_148_do_3B8 + 林_331_do_2950) && MarketInfo(林_330_st_2940,MODE_BID)>林_73_do_1C8 * 林_201_do_1C98 + 文_5_do && 林_148_do_3B8<林_74_do_1D0 * 林_201_do_1C98 + 文_10_do )
           {
             文_2_bo = true ;
             林_148_do_3B8 = MarketInfo(林_330_st_2940,MODE_BID) - 林_72_do_1C0 * 林_201_do_1C98 ;
             文_28_do = NormalizeDouble(林_76_do_1E0 / 100.0 * 林_192_do_195C_si99[林_321_in_2910],2) ;
             if ( 文_28_do<文_12_do && 文_28_do>=MarketInfo(林_330_st_2940,MODE_LOTSTEP) )
             {
               OrderClose(文_9_do,文_28_do,MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
               return(true); 
             }
           }
           if ( 文_19_bo && 林_16_in_58 == 1 && 林_18_do_68>0.0 && MarketInfo(林_330_st_2940,MODE_BID)>林_18_do_68 * 林_201_do_1C98 + (林_148_do_3B8 + 林_331_do_2950) && MarketInfo(林_330_st_2940,MODE_BID)>林_17_do_60 * 林_201_do_1C98 + 文_17_do && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && 林_148_do_3B8<林_19_do_70 * 林_201_do_1C98 + 文_10_do )
           {
             Print("Slippage control active"); 
             文_2_bo = true ;
             林_148_do_3B8 = MarketInfo(林_330_st_2940,MODE_BID) - 林_18_do_68 * 林_201_do_1C98 ;
           }
           if ( 林_84_in_220 >  0 && 林_85_in_224 >= 0 && 林_219_do_1CE8>林_148_do_3B8 + 林_189_do_1918 + 林_331_do_2950 && ( 林_219_do_1CE8<文_10_do || !(林_81_bo_214) ) && 林_219_do_1CE8<MarketInfo(林_330_st_2940,MODE_BID) - 林_86_in_228 * 林_201_do_1C98 - 林_189_do_1918 - 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             林_148_do_3B8 = 林_219_do_1CE8 ;
             文_2_bo = true ;
           }
           if ( 林_78_do_1F8>0.0 && 林_30_in_B0 == 3 && MarketInfo(林_330_st_2940,MODE_BID)>林_78_do_1F8 * 林_201_do_1C98 + 文_10_do && 林_79_do_200 * 林_201_do_1C98 + 文_10_do>文_7_do + 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_BID)>林_79_do_200 * 林_201_do_1C98 + 文_10_do + 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && NormalizeDouble(林_79_do_200 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0)>OrderStopLoss() )
           {
             林_148_do_3B8 = NormalizeDouble(林_79_do_200 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
             林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,林_148_do_3B8,文_8_do,0,0xFFFFFFFF) ;
             if ( 林_202_in_1CA0 <= 0 )
             {
               Print("error when setting breakeven: \'" + ccbsw_19(GetLastError()) + "\' ..\'Exit_BE_start\' to close to \'Exit_BE_extra_pips\' ..trying again!"); 
             }
             文_2_bo = true ;
           }
           if ( 林_78_do_1F8>0.0 && 林_30_in_B0 == 2 && MarketInfo(林_330_st_2940,MODE_BID)>林_78_do_1F8 * 林_201_do_1C98 + 文_10_do && 林_79_do_200 * 林_201_do_1C98 + 文_10_do>林_148_do_3B8 + 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_BID)>林_79_do_200 * 林_201_do_1C98 + 文_10_do + 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 )
           {
             林_148_do_3B8 = 林_79_do_200 * 林_201_do_1C98 + 文_10_do ;
             文_2_bo = true ;
           }
           if ( !(文_2_bo) && ( 林_92_in_264 == 1 || (林_92_in_264 == 2 && 林_95_do_278 * 林_201_do_1C98 + 林_148_do_3B8<=林_96_do_280 * 林_201_do_1C98 + (文_5_do + 林_1_do_0)) ) )
           {
             林_233_in_1D28 ++;
             if ( MarketInfo(林_330_st_2940,MODE_BID)>林_95_do_278 * 林_201_do_1C98 + 林_148_do_3B8 + 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_BID)<文_8_do - 林_302_do_20A8 && ( 林_93_do_268==0.0 || MarketInfo(林_330_st_2940,MODE_BID)>林_228_do_1D10 * 林_201_do_1C98 + 文_5_do ) && 林_233_in_1D28 >= 林_94_in_270 )
             {
               林_233_in_1D28 = 0 ;
               林_148_do_3B8 = 林_95_do_278 * 林_201_do_1C98 + 林_148_do_3B8 ;
               文_2_bo = true ;
             }
           }
           if ( MarketInfo(林_330_st_2940,MODE_BID)<=林_148_do_3B8 )
           {
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_BID),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( NormalizeDouble(文_4_do,林_147_in_3B0)!=NormalizeDouble(林_148_do_3B8,林_147_in_3B0) )
           {
             轩_do_41 = NormalizeDouble(林_148_do_3B8,林_147_in_3B0);
             轩_in_42 = 文_9_do;
             for (轩_in_43 = 0 ; 轩_in_43 < 林_156_in_1548 ; 轩_in_43=轩_in_43 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_43][0]==轩_in_42 )
               {
                 林_153_do_400_si20si2[轩_in_43][1] = 轩_do_41;
                 break;
               }
             }
           }
         }
       }
     }
     if ( 文_2_bo )
     {
       文_3_bo = true ;
     }
   }
   if ( 文_2_bo )
   {
     文_3_bo = true ;
   }
 }
 return(文_3_bo); 
 }
//ccbsw_16 <<==--------   --------
 bool ccbsw_17()
 {
  bool      文_2_bo = false;
  bool      文_3_bo = false;
  double    文_4_do;
  double    文_5_do;
  int       文_6_in;
  double    文_7_do;
  double    文_8_do;
  double    文_9_do;
  double    文_10_do;
  string    文_11_st;
  double    文_12_do;
  datetime  文_13_da;
  int       文_14_in;
  int       文_15_in;
  string    文_16_st;
  double    文_17_do;
  double    文_18_do;
  bool      文_19_bo;
  bool      文_20_bo;
  double    文_21_do;
  bool      文_22_bo;
  double    文_23_do;
  double    文_24_do;
  double    文_25_do;
  double    文_26_do;
  int       文_27_in;
  double    文_28_do;
//----- -----
 int        轩_in_1;
 int        轩_in_2;
 int        轩_in_3;
 double     轩_do_4;
 double     轩_do_5;
 int        轩_in_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;
 string     轩_st_11;
 double     轩_do_12;
 int        轩_in_13;
 int        轩_in_14;
 double     轩_do_15;
 int        轩_in_16;
 int        轩_in_17;
 int        轩_in_18;
 int        轩_in_19;
 int        轩_in_20;
 string     轩_st_21;
 int        轩_in_22;
 double     轩_do_23;
 double     轩_do_24;
 int        轩_in_25;
 double     轩_do_26;
 bool       轩_bo_27;
 int        轩_in_28;
 int        轩_in_29;
 double     轩_do_30;
 int        轩_in_31;
 int        轩_in_32;
 int        轩_in_33;
 double     轩_do_34;
 double     轩_do_35;
 int        轩_in_36;
 double     轩_do_37;
 bool       轩_bo_38;
 int        轩_in_39;
 int        轩_in_40;
 double     轩_do_41;
 int        轩_in_42;
 int        轩_in_43;

 文_4_do = 0.0 ;
 文_5_do = 0.0 ;
 for (文_6_in = 0 ; 文_6_in < OrdersTotal() ; 文_6_in ++)
 {
   if ( OrderSelect(文_6_in,0,0) == true )
   {
     文_2_bo = false ;
     文_7_do = NormalizeDouble(OrderStopLoss(),林_147_in_3B0) ;
     文_8_do = NormalizeDouble(OrderTakeProfit(),林_147_in_3B0) ;
     文_9_do = OrderTicket() ;
     文_10_do = NormalizeDouble(OrderOpenPrice(),林_147_in_3B0) ;
     文_11_st = OrderComment() ;
     文_12_do = OrderLots() ;
     文_13_da = OrderOpenTime() ;
     文_14_in = OrderType() ;
     文_15_in = OrderMagicNumber() ;
     文_16_st = OrderSymbol() ;
     if ( ( 文_14_in == 5 || 文_14_in == 3 ) && 林_37_in_D4 == 2 && ( 林_64_in_174 == 0 || (林_64_in_174 == 1 && 文_16_st == 林_330_st_2940) ) && ( 文_15_in == 林_65_in_178 || 林_65_in_178 == 0 ) && ( 文_11_st == 林_66_st_180 || 林_66_st_180 == "" ) )
     {
       if ( ( 文_7_do==0.0 || 文_7_do==0.0 ) )
       {
         文_7_do = NormalizeDouble(林_69_do_1A0 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       if ( ( 文_8_do==0.0 || 文_8_do==0.0 ) )
       {
         文_8_do = NormalizeDouble(文_10_do - 林_70_do_1A8 * 林_201_do_1C98,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
     }
     if ( 文_14_in == 1 && ( ( 文_15_in == 林_62_in_160 && 林_37_in_D4 == 1 && 文_16_st == 林_330_st_2940 ) || (林_37_in_D4 == 2 && ( 林_64_in_174 == 0 || (林_64_in_174 == 1 && 文_16_st == 林_330_st_2940) ) && ( 文_15_in == 林_65_in_178 || 林_65_in_178 == 0 ) && (文_11_st == 林_66_st_180 || 林_66_st_180 == "")) ) )
     {
       if ( ( 文_7_do==0.0 || 文_7_do==0.0 ) )
       {
         文_7_do = NormalizeDouble(林_69_do_1A0 * 林_201_do_1C98 + 文_10_do,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       if ( ( 文_8_do==0.0 || 文_8_do==0.0 ) )
       {
         文_8_do = NormalizeDouble(文_10_do - 林_70_do_1A8 * 林_201_do_1C98,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,Green); 
       }
       林_228_do_1D10 = 林_93_do_268 ;
       if ( 林_97_in_288 >  0 && TimeCurrent() >  文_13_da + 林_97_in_288 * 60 )
       {
         林_228_do_1D10 = 林_98_do_290 ;
       }
       轩_in_1 = 林_147_in_3B0;
       轩_in_2 = 文_9_do;
       for (轩_in_3 = 0 ; 轩_in_3 < 100 ; 轩_in_3=轩_in_3 + 1)
       {
         if ( !(林_155_do_F08_si100si2[轩_in_3][0]==轩_in_2) )   continue;
         轩_do_4 = 林_155_do_F08_si100si2[轩_in_3][1];
         break;
         
       }
       轩_do_4 = 0.0;
       文_17_do = NormalizeDouble(轩_do_4,轩_in_1) ;
       if ( 文_17_do==0.0 )
       {
         轩_do_5 = 文_10_do;
         轩_in_6 = 文_9_do;
         for (轩_in_7 = 0 ; 轩_in_7 < 100 ; 轩_in_7=轩_in_7 + 1)
         {
           if ( !(林_155_do_F08_si100si2[轩_in_7][0]==0.0) )   continue;
           林_155_do_F08_si100si2[轩_in_7][0] = 轩_in_6;
           林_155_do_F08_si100si2[轩_in_7][1] = 轩_do_5;
           break;
           
         }
         文_17_do = 文_10_do ;
       }
       else
       {
         文_17_do = 文_17_do - 林_54_do_130 * 林_201_do_1C98 ;
       }
       文_18_do = 文_17_do - 文_10_do ;
       文_19_bo = false ;
       if ( 文_17_do>林_54_do_130 * 林_201_do_1C98 && 文_18_do>林_15_do_50 * 林_201_do_1C98 )
       {
         文_19_bo = true ;
         if ( 林_16_in_58 == 2 )
         {
           林_228_do_1D10 = -1000.0 ;
           Print("Slippage Mode 2 active"); 
         }
       }
       if ( 林_20_bo_78 )
       {
         文_5_do = 文_17_do ;
       }
       else
       {
         文_5_do = 文_10_do ;
       }
       if ( 文_7_do>NormalizeDouble((林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 文_10_do + 林_1_do_0,林_147_in_3B0) )
       {
         文_7_do = NormalizeDouble((林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 文_10_do + 林_1_do_0,林_147_in_3B0) ;
         OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF); 
       }
       if ( MarketInfo(林_330_st_2940,MODE_ASK)>(林_69_do_1A0 + 林_31_do_B8) * 林_201_do_1C98 + 文_10_do + 林_1_do_0 )
       {
         RefreshRates(); 
         OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_1_do_0,Red); 
         return(true); 
       }
       文_20_bo = false ;
       if ( 林_115_bo_2FC )
       {
         轩_in_8 = 文_9_do;
         轩_in_9 = 0;
         for (轩_in_10 = OrdersTotal() ; 轩_in_10 >= 0 ; 轩_in_10=轩_in_10 - 1)
         {
           if ( OrderSelect(轩_in_10,0,0) != true || OrderMagicNumber() != 林_126_in_344 || OrderSymbol() != 林_330_st_2940 )   continue;
           轩_st_11 = OrderComment();
           if ( 轩_st_11 != IntegerToString(轩_in_8,0,32) )   continue;
           轩_in_9=轩_in_9 + 1;
           
         }
         文_21_do = 轩_in_9 ;
         文_22_bo = false ;
         if ( !(林_152_bo_3C9) )
         {
           林_152_bo_3C9 = true ;
           林_150_in_3C4 = 1 ;
         }
         if ( 文_21_do==0.0 )
         {
           林_150_in_3C4 = 1 ;
         }
         if ( MathFloor(文_21_do / 2.0)==文_21_do / 2.0 )
         {
           林_150_in_3C4 = 1 ;
         }
         else
         {
           林_150_in_3C4 = 0 ;
         }
         if ( 林_152_bo_3C9 )
         {
           if ( 文_21_do>0.0 )
           {
             轩_do_12 = AccountEquity();
             if ( 轩_do_12>AccountBalance() + 林_119_do_318 )
             {
               for (轩_in_13 = OrdersTotal() ; 轩_in_13 >= 0 ; 轩_in_13=轩_in_13 - 1)
               {
                 if ( OrderSelect(轩_in_13,0,0) != true )   continue;
                 
                 if ( ( OrderMagicNumber() != 林_62_in_160 && OrderMagicNumber() != 林_126_in_344 && OrderMagicNumber() != 林_125_in_340 ) )   continue;
                 
                 if ( OrderType() == 0 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                 }
                 if ( OrderType() != 1 )   continue;
                 OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                 
               }
             }
           }
           if ( 文_21_do>0.0 )
           {
             轩_in_14 = 文_9_do;
             轩_do_15 = 0.0;
             for (轩_in_16 = OrdersTotal() ; 轩_in_16 >= 0 ; 轩_in_16=轩_in_16 - 1)
             {
               if ( OrderSelect(轩_in_16,0,0) != true )   continue;
               
               if ( OrderTicket() != 轩_in_14 )
               {
                 轩_st_11 = OrderComment();
               if ( 轩_st_11 != IntegerToString(轩_in_14,0,32) )   continue;
               }
               轩_do_15 = 轩_do_15 + OrderProfit();
               
             }
             if ( 轩_do_15>林_119_do_318 )
             {
               Print("Closing zone"); 
               轩_in_17 = 文_9_do;
               for (轩_in_18 = OrdersTotal() ; 轩_in_18 >= 0 ; 轩_in_18=轩_in_18 - 1)
               {
                 if ( OrderSelect(轩_in_18,0,0) != true )   continue;
                 
                 if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 轩_in_17 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),3,Red); 
                 }
                 if ( OrderMagicNumber() != 林_126_in_344 )   continue;
                 轩_st_11 = OrderComment();
                 if ( 轩_st_11 != IntegerToString(轩_in_17,0,32) )   continue;
                 
                 if ( OrderType() == 0 )
                 {
                   OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                 }
                 if ( OrderType() != 1 )   continue;
                 OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                 
               }
               林_152_bo_3C9 = false ;
               文_20_bo = true ;
             }
           }
           else
           {
             文_23_do = 文_12_do * 林_121_do_328 ;
             if ( 林_120_in_320 == 2 )
             {
               文_23_do = (文_21_do + 1.0) * 文_12_do + 文_12_do ;
             }
             if ( 林_120_in_320 == 3 )
             {
               文_23_do = 文_12_do * (MathPow(林_121_do_328,文_21_do + 1.0)) ;
             }
             if ( 林_150_in_3C4 == 0 )
             {
               文_24_do = 文_17_do ;
               if ( MarketInfo(林_330_st_2940,MODE_BID)<文_17_do )
               {
                 if ( 文_21_do>=林_122_in_330 )
                 {
                   for (轩_in_19 = OrdersTotal() ; 轩_in_19 >= 0 ; 轩_in_19=轩_in_19 - 1)
                   {
                     if ( OrderSelect(轩_in_19,0,0) != true )   continue;
                     
                     if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 文_9_do )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),3,Red); 
                     }
                     if ( OrderMagicNumber() != 林_126_in_344 )   continue;
                     轩_st_11 = OrderComment();
                     if ( 轩_st_11 != IntegerToString(文_9_do,0,32) )   continue;
                     
                     if ( OrderType() == 0 )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                     }
                     if ( OrderType() != 1 )   continue;
                     OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                     
                   }
                 }
                 else
                 {
                   OrderSend(林_330_st_2940,1,文_23_do,MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,0.0,0.0,IntegerToString(文_9_do,0,32),林_126_in_344,0,Green); 
                   林_150_in_3C4 = 1 ;
                   文_22_bo = true ;
                 }
               }
             }
             else
             {
               文_25_do = 林_116_do_300 * 林_201_do_1C98 + 文_17_do - 文_21_do * 林_117_do_308 * 林_201_do_1C98 ;
               if ( 文_25_do<林_118_do_310 * 林_201_do_1C98 + 文_17_do )
               {
                 文_25_do = 林_118_do_310 * 林_201_do_1C98 + 文_17_do ;
               }
               if ( MarketInfo(林_330_st_2940,MODE_ASK)>文_25_do )
               {
                 if ( 文_21_do>=林_122_in_330 )
                 {
                   for (轩_in_20 = OrdersTotal() ; 轩_in_20 >= 0 ; 轩_in_20=轩_in_20 - 1)
                   {
                     if ( OrderSelect(轩_in_20,0,0) != true )   continue;
                     
                     if ( OrderMagicNumber() == 林_62_in_160 && OrderTicket() == 文_9_do )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),3,Red); 
                     }
                     if ( OrderMagicNumber() != 林_126_in_344 )   continue;
                     轩_st_21 = OrderComment();
                     if ( 轩_st_21 != IntegerToString(文_9_do,0,32) )   continue;
                     
                     if ( OrderType() == 0 )
                     {
                       OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
                     }
                     if ( OrderType() != 1 )   continue;
                     OrderClose(OrderTicket(),OrderLots(),MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                     
                   }
                 }
                 else
                 {
                   OrderSend(林_330_st_2940,0,文_23_do,MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,0.0,0.0,IntegerToString(文_9_do,0,32),林_126_in_344,0,Green); 
                   林_150_in_3C4 = 0 ;
                   文_22_bo = true ;
                 }
               }
             }
           }
         }
         if ( ( 文_21_do>0.0 || 文_22_bo ) )
         {
           文_20_bo = true ;
         }
       }
       if ( !(文_20_bo) )
       {
         if ( ( 林_30_in_B0 == 1 || (林_30_in_B0 != 2 && 林_30_in_B0 != 3) ) )
         {
           轩_in_22 = 文_9_do;
           轩_do_23 = 林_69_do_1A0;
           轩_do_24 = 文_10_do;
           轩_in_25 = 2;
           轩_do_26 = 0.0;
           轩_bo_27 = false;
           for (轩_in_28 = 0 ; 轩_in_28 < 林_156_in_1548 ; 轩_in_28=轩_in_28 + 1)
           {
             if ( 林_153_do_400_si20si2[轩_in_28][0]==轩_in_22 )
             {
               轩_do_26 = 林_153_do_400_si20si2[轩_in_28][1];
               轩_bo_27 = true;
               break;
             }
           }
           if ( !(轩_bo_27) )
           {
             if ( 轩_in_25 == 1 )
             {
               轩_do_26 = NormalizeDouble(轩_do_24 - 轩_do_23 * 林_201_do_1C98,林_147_in_3B0);
             }
             if ( 轩_in_25 == 2 )
             {
               轩_do_26 = NormalizeDouble(轩_do_23 * 林_201_do_1C98 + 轩_do_24,林_147_in_3B0);
             }
             for (轩_in_29 = 0 ; 轩_in_29 < 林_156_in_1548 ; 轩_in_29=轩_in_29 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_29][0]==0.0 )
               {
                 林_153_do_400_si20si2[轩_in_29][0] = 轩_in_22;
                 林_153_do_400_si20si2[轩_in_29][1] = 轩_do_26;
                 break;
               }
             }
           }
           林_148_do_3B8 = 轩_do_26 ;
           文_4_do = 林_148_do_3B8 ;
           if ( MarketInfo(林_330_st_2940,MODE_ASK)>文_4_do )
           {
             Print("Closing with virtual SL"); 
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_ASK),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( 林_89_do_248>0.0 && TimeCurrent() >= 文_13_da + 林_296_in_208C && MarketInfo(林_330_st_2940,MODE_ASK)<文_7_do - 林_331_do_2950 - 林_90_do_250 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && NormalizeDouble(MarketInfo(林_330_st_2940,MODE_ASK) + 林_90_do_250 * 林_201_do_1C98,林_147_in_3B0)<文_7_do )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_ASK) + 林_90_do_250 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do>MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting trailing Exit_TrailSL_after_X_Minutes_size loss.  Trying again!"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_72_do_1C0>0.0 && MarketInfo(林_330_st_2940,MODE_ASK)<文_7_do - 林_331_do_2950 - (林_72_do_1C0 + 林_75_do_1D8) * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)<文_5_do - 林_73_do_1C8 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && 文_7_do>文_10_do - 林_74_do_1D0 * 林_201_do_1C98 && NormalizeDouble(林_72_do_1C0 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK),林_147_in_3B0)<文_7_do )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_ASK) + 林_72_do_1C0 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do>MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting trailing Exit_stop loss.  Trying again!"); 
               }
               else
               {
                 文_26_do = NormalizeDouble(林_76_do_1E0 / 100.0 * 林_192_do_195C_si99[林_321_in_2910],2) ;
                 if ( 文_26_do<文_12_do && 文_26_do>=MarketInfo(林_330_st_2940,MODE_LOTSTEP) )
                 {
                   OrderClose(文_9_do,文_26_do,MarketInfo(林_330_st_2940,MODE_ASK),林_15_do_50,Red); 
                   return(true); 
                 }
               }
               文_2_bo = true ;
             }
           }
           if ( 文_19_bo && 林_16_in_58 == 1 && 林_18_do_68>0.0 && MarketInfo(林_330_st_2940,MODE_ASK)<文_7_do - 林_331_do_2950 - 林_18_do_68 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)<文_17_do - 林_17_do_60 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && 文_7_do>文_10_do - 林_19_do_70 * 林_201_do_1C98 && NormalizeDouble(MarketInfo(林_330_st_2940,MODE_ASK) + 林_18_do_68 * 林_201_do_1C98,林_147_in_3B0)<文_7_do )
           {
             文_7_do = NormalizeDouble(MarketInfo(林_330_st_2940,MODE_ASK) + 林_18_do_68 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do>MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("TrailStop error: \'" + ccbsw_19(GetLastError()) + "\' when setting Slip TL.  Trying again!"); 
               }
               else
               {
                 Print("Slippage controle active"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_84_in_220 >  0 && 林_85_in_224 >= 0 && 林_218_do_1CE0<文_7_do - 林_189_do_1918 - 林_331_do_2950 && ( 林_218_do_1CE0>文_10_do || !(林_81_bo_214) ) && 林_218_do_1CE0>林_86_in_228 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 + 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && NormalizeDouble(林_218_do_1CE0,林_147_in_3B0)<文_7_do )
           {
             文_7_do = NormalizeDouble(林_218_do_1CE0,林_147_in_3B0) ;
             if ( 文_7_do>MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("error: \'" + ccbsw_19(GetLastError()) + "\' when modifying stoploss"); 
               }
               文_2_bo = true ;
             }
           }
           if ( 林_78_do_1F8>0.0 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_78_do_1F8 * 林_201_do_1C98 && 文_10_do - 林_79_do_200 * 林_201_do_1C98<文_7_do - 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_79_do_200 * 林_201_do_1C98 - 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && NormalizeDouble(文_10_do - 林_79_do_200 * 林_201_do_1C98,林_147_in_3B0)<文_7_do )
           {
             文_7_do = NormalizeDouble(文_10_do - 林_79_do_200 * 林_201_do_1C98,林_147_in_3B0) ;
             if ( 文_7_do>MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 )
             {
               林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF) ;
               if ( 林_202_in_1CA0 <= 0 )
               {
                 Print("error when setting breakeven: \'" + ccbsw_19(GetLastError()) + "\' ..\'Exit_BE_start\' to close to \'Exit_BE_extra_pips\' ..trying again!"); 
               }
               文_2_bo = true ;
             }
           }
           if ( !(文_2_bo) && ( 林_92_in_264 == 1 || (林_92_in_264 == 2 && 文_7_do - 林_95_do_278 * 林_201_do_1C98>=文_5_do - 林_1_do_0 - 林_96_do_280 * 林_201_do_1C98) ) )
           {
             林_233_in_1D28 ++;
             if ( MarketInfo(林_330_st_2940,MODE_ASK)<文_7_do - 林_95_do_278 * 林_201_do_1C98 - 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && ( 林_93_do_268==0.0 || MarketInfo(林_330_st_2940,MODE_ASK)<文_5_do - 林_228_do_1D10 * 林_201_do_1C98 ) && 林_233_in_1D28 >= 林_94_in_270 && NormalizeDouble(文_7_do - 林_95_do_278 * 林_201_do_1C98,林_147_in_3B0)<文_7_do )
             {
               林_233_in_1D28 = 0 ;
               文_7_do = NormalizeDouble(文_7_do - 林_95_do_278 * 林_201_do_1C98,林_147_in_3B0) ;
               OrderModify(文_9_do,文_10_do,文_7_do,文_8_do,0,0xFFFFFFFF); 
               文_2_bo = true ;
             }
           }
           林_148_do_3B8 = 文_7_do ;
           if ( MarketInfo(林_330_st_2940,MODE_ASK)>文_7_do )
           {
             Print("Closing with virtual SL"); 
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_ASK),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( NormalizeDouble(文_4_do,林_147_in_3B0)!=NormalizeDouble(林_148_do_3B8,林_147_in_3B0) )
           {
             轩_do_30 = NormalizeDouble(林_148_do_3B8,林_147_in_3B0);
             轩_in_31 = 文_9_do;
             for (轩_in_32 = 0 ; 轩_in_32 < 林_156_in_1548 ; 轩_in_32=轩_in_32 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_32][0]==轩_in_31 )
               {
                 林_153_do_400_si20si2[轩_in_32][1] = 轩_do_30;
                 break;
               }
             }
           }
           if ( 文_2_bo && 林_99_bo_298 )
           {
             return(true); 
           }
         }
         if ( ( 林_30_in_B0 == 2 || 林_30_in_B0 == 3 ) )
         {
           轩_in_33 = 文_9_do;
           轩_do_34 = 林_69_do_1A0;
           轩_do_35 = 文_10_do;
           轩_in_36 = 2;
           轩_do_37 = 0.0;
           轩_bo_38 = false;
           for (轩_in_39 = 0 ; 轩_in_39 < 林_156_in_1548 ; 轩_in_39=轩_in_39 + 1)
           {
             if ( 林_153_do_400_si20si2[轩_in_39][0]==轩_in_33 )
             {
               轩_do_37 = 林_153_do_400_si20si2[轩_in_39][1];
               轩_bo_38 = true;
               break;
             }
           }
           if ( !(轩_bo_38) )
           {
             if ( 轩_in_36 == 1 )
             {
               轩_do_37 = NormalizeDouble(轩_do_35 - 轩_do_34 * 林_201_do_1C98,林_147_in_3B0);
             }
             if ( 轩_in_36 == 2 )
             {
               轩_do_37 = NormalizeDouble(轩_do_34 * 林_201_do_1C98 + 轩_do_35,林_147_in_3B0);
             }
             for (轩_in_40 = 0 ; 轩_in_40 < 林_156_in_1548 ; 轩_in_40=轩_in_40 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_40][0]==0.0 )
               {
                 林_153_do_400_si20si2[轩_in_40][0] = 轩_in_33;
                 林_153_do_400_si20si2[轩_in_40][1] = 轩_do_37;
                 break;
               }
             }
           }
           林_148_do_3B8 = 轩_do_37 ;
           文_4_do = 林_148_do_3B8 ;
           if ( MarketInfo(林_330_st_2940,MODE_ASK)>=文_4_do )
           {
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_ASK),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           文_27_in = TimeCurrent() - 林_312_da_20F0 ;
           if ( 文_27_in >= 林_32_in_C0 )
           {
             if ( NormalizeDouble(林_148_do_3B8,林_147_in_3B0)<文_7_do - 林_331_do_2950 )
             {
               OrderModify(文_9_do,文_10_do,NormalizeDouble(林_148_do_3B8,林_147_in_3B0),文_8_do,0,0xFFFFFFFF); 
             }
             林_312_da_20F0 = TimeCurrent() ;
           }
           if ( 林_89_do_248>0.0 && TimeCurrent() >= 文_13_da + 林_296_in_208C && MarketInfo(林_330_st_2940,MODE_ASK)<林_148_do_3B8 - 林_331_do_2950 - 林_90_do_250 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 )
           {
             林_148_do_3B8 = MarketInfo(林_330_st_2940,MODE_ASK) + 林_90_do_250 * 林_201_do_1C98 ;
             文_2_bo = true ;
           }
           if ( 林_72_do_1C0>0.0 && MarketInfo(林_330_st_2940,MODE_ASK)<林_148_do_3B8 - 林_331_do_2950 - (林_72_do_1C0 + 林_75_do_1D8) * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)<文_5_do - 林_73_do_1C8 * 林_201_do_1C98 && 林_148_do_3B8>文_10_do - 林_74_do_1D0 * 林_201_do_1C98 )
           {
             林_148_do_3B8 = 林_72_do_1C0 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) ;
             文_28_do = NormalizeDouble(林_76_do_1E0 / 100.0 * 林_192_do_195C_si99[林_321_in_2910],2) ;
             if ( 文_28_do<文_12_do && 文_28_do>=MarketInfo(林_330_st_2940,MODE_LOTSTEP) )
             {
               OrderClose(文_9_do,文_28_do,MarketInfo(林_330_st_2940,MODE_BID),林_15_do_50,Red); 
               return(true); 
             }
             文_2_bo = true ;
           }
           if ( 文_19_bo && 林_16_in_58 == 1 && 林_18_do_68>0.0 && MarketInfo(林_330_st_2940,MODE_ASK)<林_148_do_3B8 - 林_331_do_2950 - 林_18_do_68 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)<文_17_do - 林_17_do_60 * 林_201_do_1C98 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && 林_148_do_3B8>文_10_do - 林_19_do_70 * 林_201_do_1C98 )
           {
             Print("Slippage controle active"); 
             文_2_bo = true ;
             林_148_do_3B8 = MarketInfo(林_330_st_2940,MODE_ASK) + 林_18_do_68 * 林_201_do_1C98 ;
           }
           if ( 林_84_in_220 >  0 && 林_85_in_224 >= 0 && 林_218_do_1CE0<林_148_do_3B8 - 林_189_do_1918 - 林_331_do_2950 && ( 林_218_do_1CE0>文_10_do || !(林_81_bo_214) ) && 林_218_do_1CE0>林_86_in_228 * 林_201_do_1C98 + MarketInfo(林_330_st_2940,MODE_ASK) + 林_189_do_1918 + 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 )
           {
             林_148_do_3B8 = 林_218_do_1CE0 ;
             文_2_bo = true ;
           }
           if ( 林_78_do_1F8>0.0 && 林_30_in_B0 == 3 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_78_do_1F8 * 林_201_do_1C98 && 文_10_do - 林_79_do_200 * 林_201_do_1C98<文_7_do - 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_79_do_200 * 林_201_do_1C98 - 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && NormalizeDouble(文_10_do - 林_79_do_200 * 林_201_do_1C98,林_147_in_3B0)<林_148_do_3B8 )
           {
             林_148_do_3B8 = NormalizeDouble(文_10_do - 林_79_do_200 * 林_201_do_1C98,林_147_in_3B0) ;
             林_202_in_1CA0 = OrderModify(文_9_do,文_10_do,林_148_do_3B8,文_8_do,0,0xFFFFFFFF) ;
             if ( 林_202_in_1CA0 <= 0 )
             {
               Print("error when setting breakeven: \'" + ccbsw_19(GetLastError()) + "\' ..\'Exit_BE_start\' to close to \'Exit_BE_extra_pips\' ..trying again!"); 
             }
             文_2_bo = true ;
           }
           if ( 林_78_do_1F8>0.0 && 林_30_in_B0 == 2 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_78_do_1F8 * 林_201_do_1C98 && 文_10_do - 林_79_do_200 * 林_201_do_1C98<林_148_do_3B8 - 林_331_do_2950 && MarketInfo(林_330_st_2940,MODE_ASK)<文_10_do - 林_79_do_200 * 林_201_do_1C98 - 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 )
           {
             林_148_do_3B8 = 文_10_do - 林_79_do_200 * 林_201_do_1C98 ;
             文_2_bo = true ;
           }
           if ( !(文_2_bo) && ( 林_92_in_264 == 1 || (林_92_in_264 == 2 && 林_148_do_3B8 - 林_95_do_278 * 林_201_do_1C98>=文_5_do - 林_1_do_0 - 林_96_do_280 * 林_201_do_1C98) ) )
           {
             林_233_in_1D28 ++;
             if ( MarketInfo(林_330_st_2940,MODE_ASK)<林_148_do_3B8 - 林_95_do_278 * 林_201_do_1C98 - 林_189_do_1918 && MarketInfo(林_330_st_2940,MODE_ASK)>文_8_do + 林_302_do_20A8 && ( 林_93_do_268==0.0 || MarketInfo(林_330_st_2940,MODE_ASK)<文_5_do - 林_228_do_1D10 * 林_201_do_1C98 ) && 林_233_in_1D28 >= 林_94_in_270 )
             {
               林_233_in_1D28 = 0 ;
               林_148_do_3B8 = 林_148_do_3B8 - 林_95_do_278 * 林_201_do_1C98 ;
               文_2_bo = true ;
             }
           }
           if ( MarketInfo(林_330_st_2940,MODE_ASK)>=林_148_do_3B8 )
           {
             RefreshRates(); 
             OrderClose(文_9_do,文_12_do,MarketInfo(林_330_st_2940,MODE_ASK),林_1_do_0,0xFFFFFFFF); 
             return(true); 
           }
           if ( NormalizeDouble(文_4_do,林_147_in_3B0)!=NormalizeDouble(林_148_do_3B8,林_147_in_3B0) )
           {
             轩_do_41 = NormalizeDouble(林_148_do_3B8,林_147_in_3B0);
             轩_in_42 = 文_9_do;
             for (轩_in_43 = 0 ; 轩_in_43 < 林_156_in_1548 ; 轩_in_43=轩_in_43 + 1)
             {
               if ( 林_153_do_400_si20si2[轩_in_43][0]==轩_in_42 )
               {
                 林_153_do_400_si20si2[轩_in_43][1] = 轩_do_41;
                 break;
               }
             }
           }
         }
       }
     }
     if ( 文_2_bo )
     {
       文_3_bo = true ;
     }
   }
   if ( 文_2_bo )
   {
     文_3_bo = true ;
   }
 }
 return(文_3_bo); 
 }
//ccbsw_17 <<==--------   --------
 bool ccbsw_18()
 {
  bool      文_2_bo;
  datetime  文_3_da;
  int       文_4_in;
//----- -----
 bool       轩_bo_1;
 bool       轩_bo_2;
 bool       轩_bo_3;
 bool       轩_bo_4;
 bool       轩_bo_5;
 bool       轩_bo_6;

 if ( !(林_128_bo_354) )
 {
   return(true); 
 }
 文_2_bo = false ;
 文_3_da = 0 ;
 if ( 林_129_in_358 == 2 )
 {
   文_3_da = TimeCurrent() ;
 }
 if ( 林_129_in_358 == 0 )
 {
   TimeGMT(); 
 }
 if ( 林_129_in_358 == 1 )
 {
   TimeLocal(); 
 }
 文_4_in = TimeHour(文_3_da) ;
 if ( TimeDayOfWeek(文_3_da) == 0 )
 {
   if ( 林_131_in_360 <  林_132_in_364 && ( 文_4_in < 林_131_in_360 || 文_4_in >= 林_132_in_364 ) )
   {
     轩_bo_1 = false;
   }
   else
   {
     if ( 林_131_in_360 >  林_132_in_364 && 文_4_in <  林_131_in_360 && 文_4_in >= 林_132_in_364 )
     {
       轩_bo_1 = false;
     }
     else
     {
       if ( 林_131_in_360 == 林_132_in_364 )
       {
         轩_bo_1 = false;
       }
       else
       {
         轩_bo_1 = true;
       }
     }
   }
   if ( 轩_bo_1 )
   {
     文_2_bo = true ;
   }
 }
 if ( TimeDayOfWeek(文_3_da) == 1 )
 {
   if ( 林_133_in_368 <  林_134_in_36C && ( 文_4_in < 林_133_in_368 || 文_4_in >= 林_134_in_36C ) )
   {
     轩_bo_2 = false;
   }
   else
   {
     if ( 林_133_in_368 >  林_134_in_36C && 文_4_in <  林_133_in_368 && 文_4_in >= 林_134_in_36C )
     {
       轩_bo_2 = false;
     }
     else
     {
       if ( 林_133_in_368 == 林_134_in_36C )
       {
         轩_bo_2 = false;
       }
       else
       {
         轩_bo_2 = true;
       }
     }
   }
   if ( 轩_bo_2 )
   {
     文_2_bo = true ;
   }
 }
 if ( TimeDayOfWeek(文_3_da) == 2 )
 {
   if ( 林_135_in_370 <  林_136_in_374 && ( 文_4_in < 林_135_in_370 || 文_4_in >= 林_136_in_374 ) )
   {
     轩_bo_3 = false;
   }
   else
   {
     if ( 林_135_in_370 >  林_136_in_374 && 文_4_in <  林_135_in_370 && 文_4_in >= 林_136_in_374 )
     {
       轩_bo_3 = false;
     }
     else
     {
       if ( 林_135_in_370 == 林_136_in_374 )
       {
         轩_bo_3 = false;
       }
       else
       {
         轩_bo_3 = true;
       }
     }
   }
   if ( 轩_bo_3 )
   {
     文_2_bo = true ;
   }
 }
 if ( TimeDayOfWeek(文_3_da) == 3 )
 {
   if ( 林_137_in_378 <  林_138_in_37C && ( 文_4_in < 林_137_in_378 || 文_4_in >= 林_138_in_37C ) )
   {
     轩_bo_4 = false;
   }
   else
   {
     if ( 林_137_in_378 >  林_138_in_37C && 文_4_in <  林_137_in_378 && 文_4_in >= 林_138_in_37C )
     {
       轩_bo_4 = false;
     }
     else
     {
       if ( 林_137_in_378 == 林_138_in_37C )
       {
         轩_bo_4 = false;
       }
       else
       {
         轩_bo_4 = true;
       }
     }
   }
   if ( 轩_bo_4 )
   {
     文_2_bo = true ;
   }
 }
 if ( TimeDayOfWeek(文_3_da) == 4 )
 {
   if ( 林_139_in_380 <  林_140_in_384 && ( 文_4_in < 林_139_in_380 || 文_4_in >= 林_140_in_384 ) )
   {
     轩_bo_5 = false;
   }
   else
   {
     if ( 林_139_in_380 >  林_140_in_384 && 文_4_in <  林_139_in_380 && 文_4_in >= 林_140_in_384 )
     {
       轩_bo_5 = false;
     }
     else
     {
       if ( 林_139_in_380 == 林_140_in_384 )
       {
         轩_bo_5 = false;
       }
       else
       {
         轩_bo_5 = true;
       }
     }
   }
   if ( 轩_bo_5 )
   {
     文_2_bo = true ;
   }
 }
 if ( TimeDayOfWeek(文_3_da) == 5 )
 {
   if ( 林_141_in_388 <  林_142_in_38C && ( 文_4_in < 林_141_in_388 || 文_4_in >= 林_142_in_38C ) )
   {
     轩_bo_6 = false;
   }
   else
   {
     if ( 林_141_in_388 >  林_142_in_38C && 文_4_in <  林_141_in_388 && 文_4_in >= 林_142_in_38C )
     {
       轩_bo_6 = false;
     }
     else
     {
       if ( 林_141_in_388 == 林_142_in_38C )
       {
         轩_bo_6 = false;
       }
       else
       {
         轩_bo_6 = true;
       }
     }
   }
   if ( 轩_bo_6 )
   {
     文_2_bo = true ;
   }
 }
 return(文_2_bo); 
 }
//ccbsw_18 <<==--------   --------
 string ccbsw_19( int 胜_0_in)
 {
  string    文_1_st;
//----- -----

 林_257_in_1DE8 ++;
 switch(胜_0_in)
 {
   case 0 : case 1 :
   文_1_st = "no error" ;
     break;
   case 2 :
   文_1_st = "common error" ;
     break;
   case 3 :
   文_1_st = "invalid trade parameters" ;
     break;
   case 4 :
   文_1_st = "trade server is busy" ;
     break;
   case 5 :
   文_1_st = "old version of the client terminal" ;
     break;
   case 6 :
   文_1_st = "no connection with trade server" ;
     break;
   case 7 :
   文_1_st = "not enough rights" ;
     break;
   case 8 :
   文_1_st = "too frequent requests" ;
     break;
   case 9 :
   文_1_st = "malfunctional trade operation (never returned error)" ;
     break;
   case 64 :
   文_1_st = "account disabled" ;
     break;
   case 65 :
   文_1_st = "invalid account" ;
     break;
   case 128 :
   文_1_st = "trade timeout" ;
     break;
   case 129 :
   文_1_st = "invalid price" ;
     break;
   case 130 :
   文_1_st = "invalid stops" ;
     break;
   case 131 :
   文_1_st = "invalid trade volume" ;
     break;
   case 132 :
   文_1_st = "market is closed" ;
     break;
   case 133 :
   文_1_st = "trade is disabled" ;
     break;
   case 134 :
   文_1_st = "not enough money" ;
     break;
   case 135 :
   文_1_st = "price changed" ;
     break;
   case 136 :
   文_1_st = "off quotes" ;
     break;
   case 137 :
   文_1_st = "broker is busy (never returned error)" ;
     break;
   case 138 :
   文_1_st = "requote" ;
     break;
   case 139 :
   文_1_st = "order is locked" ;
     break;
   case 140 :
   文_1_st = "long positions only allowed" ;
     break;
   case 141 :
   文_1_st = "too many requests" ;
     break;
   case 145 :
   文_1_st = "modification denied because order too close to market" ;
     break;
   case 146 :
   文_1_st = "trade context is busy" ;
     break;
   case 147 :
   文_1_st = "expirations are denied by broker" ;
     break;
   case 148 :
   文_1_st = "amount of open and pending orders has reached the Exit_limit" ;
     break;
   case 149 :
   文_1_st = "hedging is prohibited" ;
     break;
   case 150 :
   文_1_st = "prohibited by FIFO rules" ;
     break;
   case 4000 :
   文_1_st = "no error (never generated code)" ;
     break;
   case 4001 :
   文_1_st = "wrong function pointer" ;
     break;
   case 4002 :
   文_1_st = "array index is out of range" ;
     break;
   case 4003 :
   文_1_st = "no memory for function call stack" ;
     break;
   case 4004 :
   文_1_st = "recursive stack overflow" ;
     break;
   case 4005 :
   文_1_st = "not enough stack for parameter" ;
     break;
   case 4006 :
   文_1_st = "no memory for parameter string" ;
     break;
   case 4007 :
   文_1_st = "no memory for temp string" ;
     break;
   case 4008 :
   文_1_st = "not initialized string" ;
     break;
   case 4009 :
   文_1_st = "not initialized string in array" ;
     break;
   case 4010 :
   文_1_st = "no memory for array\' string" ;
     break;
   case 4011 :
   文_1_st = "too long string" ;
     break;
   case 4012 :
   文_1_st = "remainder from zero divide" ;
     break;
   case 4013 :
   文_1_st = "zero divide" ;
     break;
   case 4014 :
   文_1_st = "unknown command" ;
     break;
   case 4015 :
   文_1_st = "wrong jump (never generated error)" ;
     break;
   case 4016 :
   文_1_st = "not initialized array" ;
     break;
   case 4017 :
   文_1_st = "dll calls are not allowed" ;
     break;
   case 4018 :
   文_1_st = "cannot load library" ;
     break;
   case 4019 :
   文_1_st = "cannot call function" ;
     break;
   case 4020 :
   文_1_st = "expert function calls are not allowed" ;
     break;
   case 4021 :
   文_1_st = "not enough memory for temp string returned from function" ;
     break;
   case 4022 :
   文_1_st = "system is busy (never generated error)" ;
     break;
   case 4050 :
   文_1_st = "invalid function parameters count" ;
     break;
   case 4051 :
   文_1_st = "invalid function parameter value" ;
     break;
   case 4052 :
   文_1_st = "string function internal error" ;
     break;
   case 4053 :
   文_1_st = "some array error" ;
     break;
   case 4054 :
   文_1_st = "incorrect series array using" ;
     break;
   case 4055 :
   文_1_st = "custom indicator error" ;
     break;
   case 4056 :
   文_1_st = "arrays are incompatible" ;
     break;
   case 4057 :
   文_1_st = "global variables processing error" ;
     break;
   case 4058 :
   文_1_st = "global variable not found" ;
     break;
   case 4059 :
   文_1_st = "function is not allowed in testing mode" ;
     break;
   case 4060 :
   文_1_st = "function is not confirmed" ;
     break;
   case 4061 :
   文_1_st = "send mail error" ;
     break;
   case 4062 :
   文_1_st = "string parameter expected" ;
     break;
   case 4063 :
   文_1_st = "integer parameter expected" ;
     break;
   case 4064 :
   文_1_st = "double parameter expected" ;
     break;
   case 4065 :
   文_1_st = "array as parameter expected" ;
     break;
   case 4066 :
   文_1_st = "requested history data in update state" ;
     break;
   case 4099 :
   文_1_st = "end of file" ;
     break;
   case 4100 :
   文_1_st = "some file error" ;
     break;
   case 4101 :
   文_1_st = "wrong file name" ;
     break;
   case 4102 :
   文_1_st = "too many opened files" ;
     break;
   case 4103 :
   文_1_st = "cannot open file" ;
     break;
   case 4104 :
   文_1_st = "incompatible access to a file" ;
     break;
   case 4105 :
   文_1_st = "no order selected" ;
     break;
   case 4106 :
   文_1_st = "unknown symbol" ;
     break;
   case 4107 :
   文_1_st = "invalid price parameter for trade function" ;
     break;
   case 4108 :
   文_1_st = "invalid ticket" ;
     break;
   case 4109 :
   文_1_st = "trade is not allowed in the expert properties" ;
     break;
   case 4110 :
   文_1_st = "longs are not allowed in the expert properties" ;
     break;
   case 4111 :
   文_1_st = "shorts are not allowed in the expert properties" ;
     break;
   case 4200 :
   文_1_st = "object is already exist" ;
     break;
   case 4201 :
   文_1_st = "unknown object property" ;
     break;
   case 4202 :
   文_1_st = "object is not exist" ;
     break;
   case 4203 :
   文_1_st = "unknown object type" ;
     break;
   case 4204 :
   文_1_st = "no object name" ;
     break;
   case 4205 :
   文_1_st = "object coordinates error" ;
     break;
   case 4206 :
   文_1_st = "no specified subwindow" ;
     break;
   default :
   文_1_st = "unknown error" ;
 }
 return(文_1_st);
 }
//ccbsw_19 <<==--------   --------
 void ccbsw_20( bool 胜_0_bo)
 {
  double    文_1_do;
  int       文_2_in;
  int       文_3_in;
  double    文_4_do;
  int       文_5_in;
  double    文_6_do;
  double    文_7_do;
  datetime  文_8_da;
  string    文_9_st;
  int       文_10_in;
  double    文_11_do;
  int       文_12_in;
  double    文_13_do;
  double    文_14_do;
  datetime  文_15_da;
  string    文_16_st;
  int       文_17_in;
//----- -----
 int        轩_in_1;
 int        轩_in_2;
 int        轩_in_3;
 int        轩_in_4;
 int        轩_in_5;
 int        轩_in_6;

 文_1_do = 林_101_do_2A0 / 100.0 + 1.0 ;
 if ( ( !(AccountBalance()!=林_311_do_20E8) && !(胜_0_bo) ) )   return;
 
 if ( ( !(AccountBalance()>林_311_do_20E8 * 文_1_do) && !(AccountBalance()<林_311_do_20E8 / 文_1_do) && !(胜_0_bo) ) )   return;
 ccbsw_9(林_69_do_1A0,林_61_in_15C); 
 文_2_in = OrdersTotal() ;
 for (文_3_in = 文_2_in ; 文_3_in >= 0 ; 文_3_in --)
 {
   if ( OrderSelect(文_3_in,0,0) != true || OrderMagicNumber() != 林_62_in_160 || OrderSymbol() != 林_330_st_2940 )   continue;
   
   if ( OrderType() == 4 && OrderLots()!=林_192_do_195C_si99[林_321_in_2910] )
   {
     文_4_do = OrderStopLoss() ;
     文_5_in = OrderTicket() ;
     文_6_do = OrderTakeProfit() ;
     文_7_do = OrderOpenPrice() ;
     文_8_da = OrderExpiration() ;
     文_9_st = OrderComment() ;
     OrderDelete(文_5_in,Red); 
     文_10_in = OrderSend(林_330_st_2940,4,林_192_do_195C_si99[林_321_in_2910],文_7_do,林_15_do_50,文_4_do,文_6_do,文_9_st,林_62_in_160,文_8_da,Green) ;
     轩_in_1 = 文_10_in;
     轩_in_2 = 文_5_in;
     for (轩_in_3 = 0 ; 轩_in_3 < 100 ; 轩_in_3=轩_in_3 + 1)
     {
       if ( !(林_155_do_F08_si100si2[轩_in_3][0]==轩_in_2) )   continue;
       林_155_do_F08_si100si2[轩_in_3][0] = 轩_in_1;
       break;
       
     }
     Print("Lotsize changed more than " + string(林_101_do_2A0) + "%... adjusting lotsize of pending orders"); 
     Sleep(1000); 
   }
   if ( OrderType() != 5 || !(OrderLots()!=林_192_do_195C_si99[林_321_in_2910]) )   continue;
   文_11_do = OrderStopLoss() ;
   文_12_in = OrderTicket() ;
   文_13_do = OrderTakeProfit() ;
   文_14_do = OrderOpenPrice() ;
   文_15_da = OrderExpiration() ;
   文_16_st = OrderComment() ;
   OrderDelete(文_12_in,Red); 
   文_17_in = OrderSend(林_330_st_2940,5,林_192_do_195C_si99[林_321_in_2910],文_14_do,林_15_do_50,文_11_do,文_13_do,文_16_st,林_62_in_160,文_15_da,Green) ;
   轩_in_4 = 文_17_in;
   轩_in_5 = 文_12_in;
   for (轩_in_6 = 0 ; 轩_in_6 < 100 ; 轩_in_6=轩_in_6 + 1)
   {
     if ( !(林_155_do_F08_si100si2[轩_in_6][0]==轩_in_5) )   continue;
     林_155_do_F08_si100si2[轩_in_6][0] = 轩_in_4;
     break;
     
   }
   Print("Lotsize changed more than " + string(林_101_do_2A0) + "%... adjusting lotsize of pending orders"); 
   Sleep(1000); 
   
 }
 }
//ccbsw_20 <<==--------   --------
 void ccbsw_21()
 {
  int       文_1_in = 0;
  int       文_2_in = 0;
  int       文_3_in;
  int       文_4_in;
  int       文_5_in;
  double    文_6_do;
  int       文_7_in;
  int       文_8_in;
  int       文_9_in;
  int       文_10_in;
  int       文_11_in;
  int       文_12_in;
  int       文_13_in;
  int       文_14_in;
  bool      文_15_bo;
  int       文_16_in;
  int       文_17_in;
  int       文_18_in;
  int       文_19_in;
  string    文_20_st;
  int       文_21_in;
  int       文_22_in;
  int       文_23_in;
//----- -----

 文_3_in = 20 ;
 文_4_in = 300 ;
 文_5_in = 7 ;
 文_6_do = InfoPanelSizeAdjust ;
 文_7_in = 6 ;
 文_8_in = 4 ;
 文_9_in = 350 ;
 文_10_in = 150 ;
 文_11_in = 0 ;
 文_12_in = 5 ;
 文_13_in = 20 ;
 文_14_in = 14599344 ;
 文_15_bo = false ;
 文_16_in = 0 ;
 if ( 林_9_bo_2C )
 {
   文_16_in = (林_375_in_5590 + 3) * 林_358_do_54D8 ;
 }
 ObjectCreate(0,"infopanel_rectangle",OBJ_RECTANGLE_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_XDISTANCE,文_12_in); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_YDISTANCE,文_13_in); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_XSIZE,long(文_9_in * InfoPanelSizeAdjust)); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_YSIZE,double(文_10_in * InfoPanelSizeAdjust + 文_16_in)); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_CORNER,0); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_COLOR,16711680); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_BGCOLOR,文_14_in); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_BACK,0); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_BORDER_COLOR,16711680); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_COLOR,16711680); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_BORDER_TYPE,0); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_STYLE,0); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_WIDTH,2); 
 ObjectSetInteger(0,"infopanel_rectangle",OBJPROP_SELECTABLE,0); 
 ObjectCreate(0,"line1",OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"line1",OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"line1",OBJPROP_YDISTANCE,文_13_in + 文_8_in); 
 ObjectSetInteger(0,"line1",OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 if ( !(林_9_bo_2C) )
 {
   ObjectSetString(0,"line1",OBJPROP_TEXT,"Gold Trade Pro V1.31"); 
 }
 else
 {
   ObjectSetString(0,"line1",OBJPROP_TEXT,"Gold Trade Pro V1.31 - OneChartSetup"); 
 }
 ObjectSetInteger(0,"line1",OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"linec",OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"linec",OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"linec",OBJPROP_YDISTANCE,double(文_13_in + InfoPanelSizeAdjust * 20.0 + 文_8_in)); 
 ObjectSetInteger(0,"linec",OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 ObjectSetString(0,"linec",OBJPROP_TEXT,"EA Developed by Wim Schrynemakers - 2023"); 
 ObjectSetInteger(0,"linec",OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"line2",OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"line2",OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"line2",OBJPROP_YDISTANCE,double(文_13_in + InfoPanelSizeAdjust * 32.0 + 文_8_in)); 
 ObjectSetInteger(0,"line2",OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 ObjectSetString(0,"line2",OBJPROP_TEXT,"------------------------------------------------------"); 
 ObjectSetInteger(0,"line2",OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"lines",OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"lines",OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"lines",OBJPROP_YDISTANCE,double(文_13_in + InfoPanelSizeAdjust * 44.0 + 文_8_in)); 
 ObjectSetInteger(0,"lines",OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 if ( !(林_9_bo_2C) )
 {
   if ( Risk == 9999 )
   {
     ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (using lotsizeStep=" + string(LotPerBalance_step) + ")"); 
   }
   else
   {
     if ( Risk == 999 )
     {
       ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (Max_Risk/Trade=" + string(Manual_RiskPerTrade) + "%)"); 
     }
     else
     {
       if ( Risk == 林_103_in_2B0 )
       {
         ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (Max_Risk_DD_Based=" + string(林_104_do_2B8) + "%)"); 
       }
       else
       {
         ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (using fixed lotsize)"); 
       }
     }
   }
 }
 else
 {
   if ( Risk == 9999 )
   {
     ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> using lotsizeStep=" + string(LotPerBalance_step)); 
   }
   else
   {
     if ( Risk == 999 )
     {
       ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> Max_Risk/Trade=" + string(Manual_RiskPerTrade) + "%"); 
     }
     else
     {
       if ( Risk == 林_103_in_2B0 )
       {
         ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> Max_Risk_DD_Based=" + string(林_104_do_2B8) + "%"); 
       }
       else
       {
         ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (using fixed lotsize)"); 
       }
     }
   }
 }
 ObjectSetInteger(0,"lines",OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"lineopl" + IntegerToString(0,0,32),OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_YDISTANCE,文_13_in + InfoPanelSizeAdjust * 76.0 + 文_8_in); 
 ObjectSetInteger(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 ObjectSetString(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_TEXT,"Open P/L: -"); 
 ObjectSetInteger(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"linea" + IntegerToString(0,0,32),OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"linea" + IntegerToString(0,0,32),OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"linea" + IntegerToString(0,0,32),OBJPROP_YDISTANCE,文_13_in + InfoPanelSizeAdjust * 92.0 + 文_8_in); 
 ObjectSetInteger(0,"linea" + IntegerToString(0,0,32),OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 ObjectSetString(0,"linea" + IntegerToString(0,0,32),OBJPROP_TEXT,"Account Balance: -"); 
 ObjectSetInteger(0,"linea" + IntegerToString(0,0,32),OBJPROP_COLOR,林_322_in_2914); 
 ObjectCreate(0,"linetp" + IntegerToString(0,0,32),OBJ_LABEL,0,0,0.0); 
 ObjectSetInteger(0,"linetp" + IntegerToString(0,0,32),OBJPROP_CORNER,文_11_in); 
 ObjectSetInteger(0,"linetp" + IntegerToString(0,0,32),OBJPROP_YDISTANCE,文_13_in + InfoPanelSizeAdjust * 108.0 + 文_8_in); 
 ObjectSetInteger(0,"linetp" + IntegerToString(0,0,32),OBJPROP_XDISTANCE,文_12_in + 文_7_in); 
 ObjectSetString(0,"linetp" + IntegerToString(0,0,32),OBJPROP_TEXT,"Total P/L so far: -"); 
 ObjectSetInteger(0,"linetp" + IntegerToString(0,0,32),OBJPROP_COLOR,林_322_in_2914); 
 if ( !(林_9_bo_2C) )   return;
 文_17_in = 0 ;
 文_18_in = 0 ;
 文_19_in = 0 ;
 文_21_in = 文_12_in + 文_7_in ;
 文_22_in = 文_13_in + InfoPanelSizeAdjust * 160.0 + 文_8_in ;
 文_20_st = "Pair" ;
 ccbsw_22(文_21_in,文_22_in,0,"Pair",0,0,1,0,1.0); 
 文_17_in = 1 ;
 文_18_in = 1 ;
 文_20_st = "Closed PL" ;
 if ( 林_108_in_2D4 == 1 )
 {
   文_20_st = "Closed PL*" ;
 }
 ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
 文_17_in ++;
 文_18_in ++;
 文_20_st = "PL per trade" ;
 if ( 林_108_in_2D4 == 2 )
 {
   文_20_st = "PL per trade*" ;
 }
 ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
 文_17_in ++;
 文_18_in ++;
 文_20_st = "Lotsize" ;
 ccbsw_22(文_21_in,文_22_in,文_17_in,"Lotsize",文_19_in,文_18_in,1,0,1.0); 
 文_17_in ++;
 文_18_in = 0 ;
 文_19_in ++;
 林_334_in_2B20 = 文_17_in ;
 for (文_23_in = 0 ; 文_23_in < 林_375_in_5590 ; 文_23_in ++)
 {
   文_20_st = 林_372_st_554C_si4[文_23_in] ;
   ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
   文_17_in ++;
   文_18_in ++;
   文_20_st = DoubleToString(NormalizeDouble(林_343_do_3EC4_si99[文_23_in],2),2) ;
   ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
   文_17_in ++;
   文_18_in ++;
   文_20_st = DoubleToString(NormalizeDouble(林_339_do_32BC_si99[文_23_in],2),2) ;
   ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
   文_17_in ++;
   文_18_in ++;
   文_20_st = DoubleToString(NormalizeDouble(林_192_do_195C_si99[文_23_in],2),2) ;
   ccbsw_22(文_21_in,文_22_in,文_17_in,文_20_st,文_19_in,文_18_in,1,0,1.0); 
   文_17_in ++;
   文_18_in = 0 ;
   文_19_in ++;
 }
 }
//ccbsw_21 <<==--------   --------
 void ccbsw_22( int 胜_0_in,int 胜_1_in,int 胜_2_in,string 胜_3_st,int 胜_4_in,int 胜_5_in,int 胜_6_in,int 胜_7_in,double 胜_8_do)
 {
 ObjectCreate(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJ_EDIT,0,0,0.0); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_XDISTANCE,胜_0_in + 胜_5_in * 林_357_do_54D0); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_YDISTANCE,胜_1_in + 胜_4_in * 林_358_do_54D8); 
 ObjectSetString(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_TEXT,胜_3_st); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_BACK,0); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_COLOR,胜_7_in); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_BGCOLOR,林_360_in_54E4); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_BORDER_COLOR,0); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_FONTSIZE,林_369_in_550C * 胜_8_do); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_READONLY,1); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_YSIZE,林_358_do_54D8); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_XSIZE,林_357_do_54D0); 
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_YSIZE,林_358_do_54D8); 
 if ( 胜_6_in == 0 )
 {
   ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_ALIGN,1); 
 }
 if ( 胜_6_in == 1 )
 {
   ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_ALIGN,2); 
 }
 if ( 胜_6_in != 2 )   return;
 ObjectSetInteger(0,"info_ea" + IntegerToString(胜_2_in,0,32),OBJPROP_ALIGN,0); 
 }
//ccbsw_22 <<==--------   --------
 void ccbsw_23()
 {
  int       文_1_in;
  int       文_2_in;
  int       文_3_in;
  int       文_4_in;
//----- -----

 ObjectDelete(0,"line1"); 
 ObjectDelete(0,"linec"); 
 ObjectDelete(0,"line2"); 
 ObjectDelete(0,"lines"); 
 ObjectDelete(0,"lineTradeStart"); 
 for (文_1_in = 0 ; 文_1_in <= 99 ; 文_1_in ++)
 {
   ObjectDelete(0,"lineopl" + IntegerToString(文_1_in,0,32)); 
   ObjectDelete(0,"linea" + IntegerToString(文_1_in,0,32)); 
   ObjectDelete(0,"lineto" + IntegerToString(文_1_in,0,32)); 
   ObjectDelete(0,"linetp" + IntegerToString(文_1_in,0,32)); 
   ObjectDelete(0,"linetq" + IntegerToString(文_1_in,0,32)); 
   for (文_2_in = 0 ; 文_2_in < 10 ; 文_2_in ++)
   {
     ObjectDelete(0,"tabel_info" + IntegerToString(文_1_in * 100 + 文_2_in,0,32)); 
   }
 }
 ObjectDelete(0,"infopanel_rectangle"); 
 for (文_3_in = 0 ; 文_3_in < 10 ; 文_3_in ++)
 {
   ObjectDelete(0,"tabel_heading" + IntegerToString(文_3_in,0,32)); 
   ObjectDelete(0,"tabel_totals" + IntegerToString(文_3_in,0,32)); 
 }
 for (文_4_in = 0 ; 文_4_in < 林_356_in_54C8 ; 文_4_in ++)
 {
   ObjectDelete(0,"horizontalrect" + IntegerToString(文_4_in,0,32)); 
   ObjectDelete(0,"info_ea" + IntegerToString(文_4_in,0,32)); 
 }
 }
//ccbsw_23 <<==--------   --------
 void ccbsw_24()
 {
 double     轩_do_1;
 int        轩_in_2;
 int        轩_in_3;
 int        轩_in_4;
 int        轩_in_5;
 int        轩_in_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;
 int        轩_in_11;

 if ( !(ShowInfoPanel) )   return;
 
 if ( ( MQLInfoInteger(MQL_TESTER) == 1 && !(UpdateInfoTesting) ) )   return;
 轩_do_1 = 0.0;
 for (轩_in_2 = OrdersTotal() ; 轩_in_2 >= 0 ; 轩_in_2=轩_in_2 - 1)
 {
   if ( OrderSelect(轩_in_2,0,0) != true )   continue;
   
   if ( ( OrderSymbol() != 林_330_st_2940 && !(林_9_bo_2C) ) )   continue;
   轩_in_3 = OrderMagicNumber();
   轩_in_4=ST1_MagicNumber + 1;
   if ( 轩_in_3 != 轩_in_4 )
   {
     轩_in_4 = OrderMagicNumber();
     轩_in_5=ST1_MagicNumber + 2;
     if ( 轩_in_4 != 轩_in_5 )
     {
       轩_in_5 = OrderMagicNumber();
       轩_in_6=ST1_MagicNumber + 3;
       if ( 轩_in_5 != 轩_in_6 )
       {
         轩_in_6 = OrderMagicNumber();
         轩_in_7=ST1_MagicNumber + 4;
         if ( 轩_in_6 != 轩_in_7 )
         {
           轩_in_7 = OrderMagicNumber();
           轩_in_8=ST1_MagicNumber + 5;
           if ( 轩_in_7 != 轩_in_8 )
           {
             轩_in_8 = OrderMagicNumber();
             轩_in_9=ST1_MagicNumber + 6;
             if ( 轩_in_8 != 轩_in_9 )
             {
               轩_in_9 = OrderMagicNumber();
               轩_in_10=ST1_MagicNumber + 7;
               if ( 轩_in_9 != 轩_in_10 )
               {
                 轩_in_10 = OrderMagicNumber();
                 轩_in_11=ST1_MagicNumber + 8;
               if ( 轩_in_10 != 轩_in_11 )   continue;
               }
             }
           }
         }
       }
     }
   }
   if ( ( OrderType() != 0 && OrderType() != 1 ) )   continue;
   轩_do_1 = OrderProfit() + OrderSwap() + OrderCommission() + 轩_do_1;
   
 }
 林_316_do_24B0_si30[林_321_in_2910] = 轩_do_1;
 ObjectSetString(0,"lineopl" + IntegerToString(0,0,32),OBJPROP_TEXT,"Open P/L: " + DoubleToString(轩_do_1,2)); 
 ObjectSetString(0,"linea" + IntegerToString(0,0,32),OBJPROP_TEXT,"Account Balance: " + DoubleToString(AccountBalance(),2)); 
 if ( !(林_9_bo_2C) )
 {
   if ( Risk == 9999 )
   {
     ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (using lotsizeStep=" + string(LotPerBalance_step) + ")"); 
     return;
   }
   if ( Risk == 999 )
   {
     ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (Max_Risk/Trade=" + string(Manual_RiskPerTrade) + "%)"); 
     return;
   }
   if ( Risk == 林_103_in_2B0 )
   {
     ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (Max_Risk_DD_Based=" + string(林_104_do_2B8) + "%)"); 
     return;
   }
   ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[0],2),2) + " (using fixed lotsize)"); 
   return;
 }
 if ( Risk == 9999 )
 {
   ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> using lotsizeStep=" + string(LotPerBalance_step)); 
   return;
 }
 if ( Risk == 999 )
 {
   ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> Max_Risk/Trade=" + string(Manual_RiskPerTrade) + "%"); 
   return;
 }
 if ( Risk == 林_103_in_2B0 )
 {
   ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize -> Max_Risk_DD_Based=" + string(林_104_do_2B8) + "%"); 
   return;
 }
 ObjectSetString(0,"lines",OBJPROP_TEXT,"Current Lotsize: " + DoubleToString(NormalizeDouble(林_192_do_195C_si99[林_333_in_2994_si99[0]],2),2) + " (using fixed lotsize)"); 
 }
//ccbsw_24 <<==--------   --------
 void ccbsw_25()
 {
  int       文_1_in;
  string    文_2_st;
  int       文_3_in;
//----- -----

 if ( !(ShowInfoPanel) )   return;
 
 if ( ( MQLInfoInteger(MQL_TESTER) == 1 && !(UpdateInfoTesting) ) || !(林_9_bo_2C) )   return;
 文_1_in = 林_334_in_2B20 ;
 for (文_3_in = 0 ; 文_3_in < 林_375_in_5590 ; 文_3_in ++)
 {
   文_2_st = 林_372_st_554C_si4[文_3_in] ;
   if ( 林_342_bo_3E2C_si99[林_333_in_2994_si99[文_3_in]] != 0x0 )
   {
     ObjectSetInteger(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_BGCOLOR,255); 
   }
   else
   {
     ObjectSetInteger(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_BGCOLOR,林_360_in_54E4); 
   }
   ObjectSetString(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_TEXT,文_2_st); 
   文_1_in ++;
   文_2_st = DoubleToString(NormalizeDouble(林_343_do_3EC4_si99[文_3_in],2),2) ;
   ObjectSetString(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_TEXT,文_2_st); 
   文_1_in ++;
   文_2_st = DoubleToString(NormalizeDouble(林_339_do_32BC_si99[文_3_in],2),2) ;
   ObjectSetString(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_TEXT,文_2_st); 
   文_1_in ++;
   文_2_st = DoubleToString(NormalizeDouble(林_192_do_195C_si99[文_3_in],2),2) ;
   ObjectSetString(0,"info_ea" + IntegerToString(文_1_in,0,32),OBJPROP_TEXT,文_2_st); 
   文_1_in ++;
 }
 }
//ccbsw_25 <<==--------   --------
 void ccbsw_26()
 {
 int        轩_in_1;
 double     轩_do_2;
 int        轩_in_3;
 int        轩_in_4;
 int        轩_in_5;
 int        轩_in_6;
 int        轩_in_7;
 int        轩_in_8;
 int        轩_in_9;
 int        轩_in_10;
 int        轩_in_11;
 int        轩_in_12;
 int        轩_in_13;
 int        轩_in_14;
 string     轩_st_15;
 int        轩_in_16;
 double     轩_do_17;
 int        轩_in_18;
 int        轩_in_19;
 int        轩_in_20;
 int        轩_in_21;
 int        轩_in_22;
 int        轩_in_23;
 int        轩_in_24;
 int        轩_in_25;
 int        轩_in_26;
 int        轩_in_27;
 int        轩_in_28;
 int        轩_in_29;
 int        轩_in_30;
 double     轩_do_31;
 int        轩_in_32;
 int        轩_in_33;
 int        轩_in_34;
 int        轩_in_35;
 int        轩_in_36;
 int        轩_in_37;
 int        轩_in_38;
 int        轩_in_39;
 int        轩_in_40;
 int        轩_in_41;
 int        轩_in_42;

 if ( !(ShowInfoPanel) )   return;
 
 if ( ( MQLInfoInteger(MQL_TESTER) == 1 && !(UpdateInfoTesting) ) )   return;
 轩_in_1 = 9999999;
 轩_do_2 = 0.0;
 轩_in_3 = 0;
 轩_in_4 = 0;
 for (轩_in_5 = HistoryTotal() ; 轩_in_5 >= 0 ; 轩_in_5=轩_in_5 - 1)
 {
   if ( OrderSelect(轩_in_5,0,1) != true )   continue;
   
   if ( ( OrderSymbol() != 林_330_st_2940 && !(林_9_bo_2C) ) )   continue;
   轩_in_6 = OrderMagicNumber();
   轩_in_7=ST1_MagicNumber + 1;
   if ( 轩_in_6 != 轩_in_7 )
   {
     轩_in_7 = OrderMagicNumber();
     轩_in_8=ST1_MagicNumber + 2;
     if ( 轩_in_7 != 轩_in_8 )
     {
       轩_in_8 = OrderMagicNumber();
       轩_in_9=ST1_MagicNumber + 3;
       if ( 轩_in_8 != 轩_in_9 )
       {
         轩_in_9 = OrderMagicNumber();
         轩_in_10=ST1_MagicNumber + 4;
         if ( 轩_in_9 != 轩_in_10 )
         {
           轩_in_10 = OrderMagicNumber();
           轩_in_11=ST1_MagicNumber + 5;
           if ( 轩_in_10 != 轩_in_11 )
           {
             轩_in_11 = OrderMagicNumber();
             轩_in_12=ST1_MagicNumber + 6;
             if ( 轩_in_11 != 轩_in_12 )
             {
               轩_in_12 = OrderMagicNumber();
               轩_in_13=ST1_MagicNumber + 7;
               if ( 轩_in_12 != 轩_in_13 )
               {
                 轩_in_13 = OrderMagicNumber();
                 轩_in_14=ST1_MagicNumber + 8;
               if ( 轩_in_13 != 轩_in_14 )   continue;
               }
             }
           }
         }
       }
     }
   }
   轩_in_3=轩_in_3 + 1;
   if ( ( OrderType() == 0 || OrderType() == 1 ) )
   {
     if ( OrderType() == 0 )
     {
       轩_do_2 = OrderClosePrice() - OrderOpenPrice();
     }
     else
     {
       if ( OrderType() == 1 )
       {
         轩_do_2 = OrderOpenPrice() - OrderClosePrice();
       }
     }
     if ( 轩_do_2>0.0 )
     {
       轩_in_4=轩_in_4 + 1;
     }
   }
   if ( 轩_in_3 >= 轩_in_1 )   break;
   
 }
 林_317_do_25D4_si30[林_321_in_2910] = 轩_in_4;
 轩_st_15="Total profits/losses so far: " + IntegerToString(轩_in_4,0,32) + "/";
 轩_in_16 = 9999999;
 轩_do_17 = 0.0;
 轩_in_18 = 0;
 轩_in_19 = 0;
 for (轩_in_20 = HistoryTotal() ; 轩_in_20 >= 0 ; 轩_in_20=轩_in_20 - 1)
 {
   if ( OrderSelect(轩_in_20,0,1) != true )   continue;
   
   if ( ( OrderSymbol() != 林_330_st_2940 && !(林_9_bo_2C) ) )   continue;
   轩_in_21 = OrderMagicNumber();
   轩_in_22=ST1_MagicNumber + 1;
   if ( 轩_in_21 != 轩_in_22 )
   {
     轩_in_22 = OrderMagicNumber();
     轩_in_23=ST1_MagicNumber + 2;
     if ( 轩_in_22 != 轩_in_23 )
     {
       轩_in_23 = OrderMagicNumber();
       轩_in_24=ST1_MagicNumber + 3;
       if ( 轩_in_23 != 轩_in_24 )
       {
         轩_in_24 = OrderMagicNumber();
         轩_in_25=ST1_MagicNumber + 4;
         if ( 轩_in_24 != 轩_in_25 )
         {
           轩_in_25 = OrderMagicNumber();
           轩_in_26=ST1_MagicNumber + 5;
           if ( 轩_in_25 != 轩_in_26 )
           {
             轩_in_26 = OrderMagicNumber();
             轩_in_27=ST1_MagicNumber + 6;
             if ( 轩_in_26 != 轩_in_27 )
             {
               轩_in_27 = OrderMagicNumber();
               轩_in_28=ST1_MagicNumber + 7;
               if ( 轩_in_27 != 轩_in_28 )
               {
                 轩_in_28 = OrderMagicNumber();
                 轩_in_29=ST1_MagicNumber + 8;
               if ( 轩_in_28 != 轩_in_29 )   continue;
               }
             }
           }
         }
       }
     }
   }
   轩_in_18=轩_in_18 + 1;
   if ( OrderType() == 0 )
   {
     轩_do_17 = OrderClosePrice() - OrderOpenPrice();
   }
   else
   {
     if ( OrderType() == 1 )
     {
       轩_do_17 = OrderOpenPrice() - OrderClosePrice();
     }
   }
   if ( 轩_do_17<0.0 )
   {
     轩_in_19=轩_in_19 + 1;
   }
   if ( 轩_in_18 >= 轩_in_16 )   break;
   
 }
 林_318_do_26F8_si30[林_321_in_2910] = 轩_in_19;
 轩_st_15=轩_st_15 + IntegerToString(轩_in_19,0,32);
 ObjectSetString(0,"lineto" + IntegerToString(0,0,32),OBJPROP_TEXT,轩_st_15); 
 轩_in_30 = 1000;
 轩_do_31 = 0.0;
 轩_in_32 = 0;
 for (轩_in_33 = HistoryTotal() ; 轩_in_33 >= 0 ; 轩_in_33=轩_in_33 - 1)
 {
   if ( OrderSelect(轩_in_33,0,1) != true )   continue;
   
   if ( ( OrderSymbol() != 林_330_st_2940 && !(林_9_bo_2C) ) )   continue;
   轩_in_34 = OrderMagicNumber();
   轩_in_35=ST1_MagicNumber + 1;
   if ( 轩_in_34 != 轩_in_35 )
   {
     轩_in_35 = OrderMagicNumber();
     轩_in_36=ST1_MagicNumber + 2;
     if ( 轩_in_35 != 轩_in_36 )
     {
       轩_in_36 = OrderMagicNumber();
       轩_in_37=ST1_MagicNumber + 3;
       if ( 轩_in_36 != 轩_in_37 )
       {
         轩_in_37 = OrderMagicNumber();
         轩_in_38=ST1_MagicNumber + 4;
         if ( 轩_in_37 != 轩_in_38 )
         {
           轩_in_38 = OrderMagicNumber();
           轩_in_39=ST1_MagicNumber + 5;
           if ( 轩_in_38 != 轩_in_39 )
           {
             轩_in_39 = OrderMagicNumber();
             轩_in_40=ST1_MagicNumber + 6;
             if ( 轩_in_39 != 轩_in_40 )
             {
               轩_in_40 = OrderMagicNumber();
               轩_in_41=ST1_MagicNumber + 7;
               if ( 轩_in_40 != 轩_in_41 )
               {
                 轩_in_41 = OrderMagicNumber();
                 轩_in_42=ST1_MagicNumber + 8;
               if ( 轩_in_41 != 轩_in_42 )   continue;
               }
             }
           }
         }
       }
     }
   }
   轩_in_32=轩_in_32 + 1;
   轩_do_31 = 轩_do_31 + OrderProfit() + OrderSwap() + OrderCommission();
   if ( 轩_in_32 >= 轩_in_30 )   break;
   
 }
 林_319_do_281C_si30[林_321_in_2910] = 轩_do_31;
 ObjectSetString(0,"linetp" + IntegerToString(0,0,32),OBJPROP_TEXT,"Total P/L so far: " + DoubleToString(NormalizeDouble(轩_do_31,2),2)); 
 }
//ccbsw_26 <<==--------   --------
 void ccbsw_27()
 {
  int       文_1_in = 0;
  double    文_2_do_si99[99];
  double    文_3_do_si99[99];
  int       文_4_in;
  int       文_5_in;
  bool      文_6_bo;
  int       文_7_in;
  double    文_8_do;
  int       文_9_in;
  int       文_10_in;
//----- -----
 long       轩_lo_1;
 long       轩_lo_2;
 long       轩_lo_3;
 long       轩_lo_4;
 long       轩_lo_5;

 for (文_4_in = 0 ; 文_4_in < 林_375_in_5590 ; 文_4_in ++)
 {
   文_2_do_si99[文_4_in] = 0.0;
   文_3_do_si99[文_4_in] = 0.0;
   林_336_bo_2EA4_si99[文_4_in] = false;
   林_337_in_2F3C_si99[文_4_in] = 0;
   林_338_in_30FC_si99[文_4_in] = 0;
 }
 for (文_5_in = HistoryTotal() ; 文_5_in >= 0 ; 文_5_in --)
 {
   if ( OrderSelect(文_5_in,0,1) != true || OrderMagicNumber() != 林_62_in_160 )   continue;
   文_6_bo = true ;
   for (文_7_in = 0 ; 文_7_in < 林_375_in_5590 ; 文_7_in ++)
   {
     if ( 林_336_bo_2EA4_si99[文_7_in] == 0x0 )
     {
       文_6_bo = false ;
     }
   }
   if ( ( OrderCloseTime() <  TimeCurrent() - 林_109_in_2D8 * 24 * 60 * 60 && 文_6_bo ) )   break;
   文_8_do = OrderLots() * 100.0 ;
   if ( 林_107_in_2D0 == 1 )
   {
     文_8_do = 1.0 ;
   }
   文_9_in = 0 ;
   if ( 林_375_in_5590 <= 0 )   continue;
   
   for ( ; 文_9_in < 林_375_in_5590 ; 文_9_in ++)
   {
     if ( 林_341_st_3954_si99[文_9_in] != OrderSymbol() )   continue;
     
     if ( ( OrderType() != 0 && OrderType() != 1 ) )   continue;
     轩_lo_1 = OrderCloseTime();
     轩_lo_2=TimeCurrent() - 林_109_in_2D8 * 24 * 60 * 60;
     if ( 轩_lo_1 <  轩_lo_2 )
     {
       轩_lo_2 = OrderCloseTime();
       轩_lo_3=TimeCurrent() - 林_109_in_2D8 * 24 * 60 * 60;
     if ( (轩_lo_2 >= 轩_lo_3 || 林_336_bo_2EA4_si99[文_9_in] != 0x0) )   continue;
     }
     林_337_in_2F3C_si99[文_9_in] ++;
     if ( 林_337_in_2F3C_si99[文_9_in] >= 林_111_in_2E0 )
     {
       林_336_bo_2EA4_si99[文_9_in] = true;
     }
     文_2_do_si99[文_9_in] +=OrderProfit() / 文_8_do;
     文_2_do_si99[文_9_in] +=OrderSwap() / 文_8_do;
     文_2_do_si99[文_9_in] +=OrderCommission() / 文_8_do;
     轩_lo_4 = OrderCloseTime();
     轩_lo_5=TimeCurrent() - 林_110_in_2DC * 24 * 60 * 60;
     if ( 轩_lo_4 < 轩_lo_5 )   continue;
     文_3_do_si99[文_9_in] +=OrderProfit() / 文_8_do;
     文_3_do_si99[文_9_in] +=OrderSwap() / 文_8_do;
     文_3_do_si99[文_9_in] +=OrderCommission() / 文_8_do;
     林_338_in_30FC_si99[文_9_in] ++;
     
   }
   
 }
 for (文_10_in = 0 ; 文_10_in < 林_375_in_5590 ; 文_10_in ++)
 {
   林_343_do_3EC4_si99[文_10_in] = 文_2_do_si99[文_10_in];
   if ( 林_337_in_2F3C_si99[文_10_in] >  0x0 )
   {
     林_339_do_32BC_si99[文_10_in] = NormalizeDouble(文_2_do_si99[文_10_in] / 林_337_in_2F3C_si99[文_10_in],2);
   }
   else
   {
     林_339_do_32BC_si99[文_10_in] = 0.0;
   }
   林_344_do_4210_si99[文_10_in] = 文_3_do_si99[文_10_in];
   if ( 林_338_in_30FC_si99[文_10_in] >  0x0 )
   {
     林_340_do_3608_si99[文_10_in] = NormalizeDouble(文_3_do_si99[文_10_in] / 林_338_in_30FC_si99[文_10_in],2);
   }
   else
   {
     林_340_do_3608_si99[文_10_in] = 0.0;
   }
 }
 }
//ccbsw_27 <<==--------   --------
 void ccbsw_28()
 {
  int       文_1_in;
  double    文_2_do;
  int       文_3_in;
  int       文_4_in;
  int       文_5_in;
  int       文_6_in;
  bool      文_7_bo;
  int       文_8_in;
  int       文_9_in;
  int       文_10_in;
  int       文_11_in;
//----- -----

 ccbsw_27(); 
 for (文_1_in = 0 ; 文_1_in < 林_375_in_5590 ; 文_1_in ++)
 {
   文_2_do = 林_343_do_3EC4_si99[文_1_in] ;
   文_3_in = 1 ;
   for (文_4_in = 0 ; 文_4_in < 林_375_in_5590 ; 文_4_in ++)
   {
     if ( 文_4_in == 文_1_in || !(林_343_do_3EC4_si99[文_4_in]>文_2_do) )   continue;
     文_3_in ++;
     
   }
   林_350_in_5324_si99[文_1_in] = 文_3_in;
 }
 for (文_5_in = 0 ; 文_5_in < 林_375_in_5590 ; 文_5_in ++)
 {
   文_6_in = 林_350_in_5324_si99[文_5_in] ;
   文_7_bo = true ;
   do
   {
     文_7_bo = false ;
     文_8_in = 0 ;
     if ( 林_375_in_5590 <= 0 )   continue;
     
     for ( ; 文_8_in < 林_375_in_5590 ; 文_8_in ++)
     {
       if ( 文_8_in == 文_5_in || 林_350_in_5324_si99[文_8_in] != 林_350_in_5324_si99[文_5_in] )   continue;
       林_350_in_5324_si99[文_8_in] ++;
       文_7_bo = true ;
       
     }
     
   }
   while(文_7_bo);
   
 }
 for (文_9_in = 0 ; 文_9_in < 林_375_in_5590 ; 文_9_in ++)
 {
   林_348_do_4F40_si99[文_9_in] = 1.0;
 }
 for (文_10_in = 1 ; 文_10_in <= 林_375_in_5590 ; 文_10_in ++)
 {
   for (文_11_in = 0 ; 文_11_in < 林_375_in_5590 ; 文_11_in ++)
   {
     if ( 林_350_in_5324_si99[文_11_in] == 文_10_in )
     {
       林_333_in_2994_si99[文_10_in - 1] = 文_11_in;
     }
   }
 }
 }
//ccbsw_28 <<==--------   --------
 void ccbsw_29()
 {
  int       文_1_in;
  double    文_2_do;
  int       文_3_in;
  int       文_4_in;
  int       文_5_in;
  int       文_6_in;
  bool      文_7_bo;
  int       文_8_in;
  int       文_9_in;
  int       文_10_in;
  int       文_11_in;
//----- -----

 ccbsw_27(); 
 for (文_1_in = 0 ; 文_1_in < 林_375_in_5590 ; 文_1_in ++)
 {
   文_2_do = 林_339_do_32BC_si99[文_1_in] ;
   文_3_in = 1 ;
   for (文_4_in = 0 ; 文_4_in < 林_375_in_5590 ; 文_4_in ++)
   {
     if ( 文_4_in == 文_1_in || !(林_339_do_32BC_si99[文_4_in]>文_2_do) )   continue;
     文_3_in ++;
     
   }
   林_350_in_5324_si99[文_1_in] = 文_3_in;
 }
 for (文_5_in = 0 ; 文_5_in < 林_375_in_5590 ; 文_5_in ++)
 {
   文_6_in = 林_350_in_5324_si99[文_5_in] ;
   文_7_bo = true ;
   do
   {
     文_7_bo = false ;
     文_8_in = 0 ;
     if ( 林_375_in_5590 <= 0 )   continue;
     
     for ( ; 文_8_in < 林_375_in_5590 ; 文_8_in ++)
     {
       if ( 文_8_in == 文_5_in || 林_350_in_5324_si99[文_8_in] != 林_350_in_5324_si99[文_5_in] )   continue;
       林_350_in_5324_si99[文_8_in] ++;
       文_7_bo = true ;
       
     }
     
   }
   while(文_7_bo);
   
 }
 for (文_9_in = 0 ; 文_9_in < 林_375_in_5590 ; 文_9_in ++)
 {
   林_348_do_4F40_si99[文_9_in] = 1.0;
 }
 for (文_10_in = 1 ; 文_10_in <= 林_375_in_5590 ; 文_10_in ++)
 {
   for (文_11_in = 0 ; 文_11_in < 林_375_in_5590 ; 文_11_in ++)
   {
     if ( 林_350_in_5324_si99[文_11_in] == 文_10_in )
     {
       林_333_in_2994_si99[文_10_in - 1] = 文_11_in;
     }
   }
 }
 }
//<<==ccbsw_29 <<==

