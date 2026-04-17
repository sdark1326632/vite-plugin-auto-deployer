const { formatMessage, logMessage } = require('./utils/messageFormatter');
const { validateDeploymentConfig } = require('./validators/configValidator');
const { getEnvironmentMode } = require('./utils/environment');
const DeploymentHandler = require('./core/DeploymentHandler');

module.exports = function (options) {
  let currentMode = 'development';
  let buildOutDir = 'dist';
  
  return {
    name: "vite-plugin-auto-deployer",
    
    configResolved(resolvedConfig) {
      // 修复拼写错误和正确的属性访问
      currentMode = getEnvironmentMode(resolvedConfig);
      buildOutDir = resolvedConfig.build?.outDir || 'dist';
    },
    
    async closeBundle() {
      // 开发环境跳过部署
      if (currentMode === 'development') {
        logMessage('info', 'SKIP_DEV_ENV');
        return;
      }
      
      // 处理单个配置或配置数组
      let deployConfigs = [];
      
      if (Array.isArray(options)) {
        // 多服务器配置 - 根据 mode 查找所有匹配的配置（支持同一环境的多服务器并行部署）
        const matchingConfigs = options.filter(item => item.mode === currentMode);
        if (matchingConfigs.length > 0) {
          deployConfigs = matchingConfigs;
        } else {
          logMessage('warning', 'NO_MATCHING_CONFIG', { mode: currentMode });
          return;
        }
      } else {
        // 单服务器配置
        const deployConfig = options;
        // 如果配置了 mode，检查是否匹配
        if (deployConfig.mode && deployConfig.mode !== currentMode) {
          logMessage('warning', 'MODE_MISMATCH', { configMode: deployConfig.mode, currentMode });
          return;
        }
        deployConfigs = [deployConfig];
      }
      
      // 验证和准备所有配置
      const validConfigs = [];
      for (const config of deployConfigs) {
        // 合并配置
        const finalConfig = {
          ...config,
          outDir: config.outDir || buildOutDir,
          mode: currentMode
        };
        
        // 验证配置
        if (await validateDeploymentConfig(finalConfig)) {
          validConfigs.push(finalConfig);
        }
      }
      
      if (validConfigs.length === 0) {
        return;
      }
      
      try {
        const deploymentHandler = new DeploymentHandler();
        
        // 收集缺失的登录信息（仅对第一个配置，假设所有服务器使用相同凭证）
        const completeConfig = await deploymentHandler.collectLoginInfo(validConfigs[0]);
        
        // 应用相同的登录信息到所有配置（如果它们没有自己的凭证）
        const finalConfigs = validConfigs.map(config => {
          if (!config.username && !config.password && !config.privateKeyPath) {
            return { ...config, username: completeConfig.username, password: completeConfig.password };
          }
          return config;
        });
        
        // 显示部署信息
        if (finalConfigs.length === 1) {
          const config = finalConfigs[0];
          if (config.name) {
            logMessage('cyan', 'STARTING_DEPLOYMENT_NAMED', { name: config.name, mode: currentMode });
          } else {
            logMessage('cyan', 'STARTING_DEPLOYMENT_UNNAMED', { host: config.host, path: config.path, mode: currentMode });
          }
        }
        
        // 执行部署
        await deploymentHandler.deployMultipleServers(finalConfigs);
        
      } catch (error) {
        logMessage('error', 'DEPLOYMENT_ERROR', { error: error.message });
        logMessage('warning', 'CHECK_CONFIG_AND_RETRY');
        // 不抛出错误，避免构建失败
      }
    }
  };
};